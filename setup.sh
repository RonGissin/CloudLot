#!/bin/bash
# debug
# set -o xtrace

KEY_NAME="cloud-lot-`date +'%N'`"
KEY_PEM="$KEY_NAME.pem"

ROLE_NAME="CloudLotDynamoDB"
INSTANCE_PROFILE="CloudLotInstanceProfile"
DYNAMO_DB_FULL_ACCESS_POLICY_ARN="arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
TABLE_NAME="CloudLotParkingTickets"

echo "creating IAM service role - $ROLE_NAME for ec2 to assume"
aws iam create-role --role-name $ROLE_NAME --description "role to allow access to dynamodb" --assume-role-policy-document file://RoleEC2TrustPolicy.json
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn  $DYNAMO_DB_FULL_ACCESS_POLICY_ARN
aws iam create-instance-profile --instance-profile-name $INSTANCE_PROFILE
aws iam add-role-to-instance-profile --role-name $ROLE_NAME --instance-profile-name $INSTANCE_PROFILE   

echo "create key pair $KEY_PEM to connect to instances and save locally"
aws ec2 create-key-pair --key-name $KEY_NAME --query "KeyMaterial" --output text > $KEY_PEM 

# secure the key pair
chmod 400 $KEY_PEM

SEC_GRP="cl-sg-`date +'%N'`"

echo "setup firewall $SEC_GRP"
aws ec2 create-security-group   \
    --group-name $SEC_GRP       \
    --description "Access my instances" 

# figure out my ip
MY_IP=$(curl ipinfo.io/ip)
echo "My IP: $MY_IP"


echo "setup rule allowing SSH access to $MY_IP only"
aws ec2 authorize-security-group-ingress        \
    --group-name $SEC_GRP --port 22 --protocol tcp \
    --cidr $MY_IP/32

echo "setup rule allowing HTTP (port 3000) access to $MY_IP only"
aws ec2 authorize-security-group-ingress        \
    --group-name $SEC_GRP --port 3000 --protocol tcp \
    --cidr $MY_IP/32

UBUNTU_AMI="ami-05d72852800cbf29e"

echo "Creating Ubuntu 20.04 instance..."
RUN_INSTANCES=$(aws ec2 run-instances   \
    --image-id $UBUNTU_AMI        \
    --instance-type t3.micro            \
    --key-name $KEY_NAME                \
    --iam-instance-profile Name=$INSTANCE_PROFILE    \
    --security-groups $SEC_GRP)

INSTANCE_ID=$(echo $RUN_INSTANCES | jq -r '.Instances[0].InstanceId')

echo "Waiting for instance creation..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

PUBLIC_IP=$(aws ec2 describe-instances  --instance-ids $INSTANCE_ID | 
    jq -r '.Reservations[0].Instances[0].PublicIpAddress'
)

echo "New instance $INSTANCE_ID @ $PUBLIC_IP"

echo "setup production environment"
ssh -i $KEY_PEM -o "StrictHostKeyChecking=no" -o "ConnectionAttempts=10" ec2-user@$PUBLIC_IP <<EOF
    # update
    sudo yum update -y

    # install git
    sudo yum install git -y

    # install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

    # activate nvm
    . ~/.nvm/nvm.sh

    # install node
    nvm install node

    # get app from github
    git clone https://github.com/RonGissin/CloudLot.git

    # install dependencies
    cd CloudLot
    npm install

    # run app
    nohup npm start --host 0.0.0.0  &>/dev/null &
    exit
EOF

echo "creating dynamoDB table for persistent storage"
aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

echo "test that it all worked"
curl  --retry-connrefused --retry 10 --retry-delay 5  http://$PUBLIC_IP:3000