# CloudLot
A sample parking lot management service run on the cloud.

## Overview
This project is a simple example of a REST api service that is entirely run in the cloud (AWS)\
It simulates a parking lot service, helping to keep track of vehicles entering and exiting the lot,\
as well as billing for parking time.\
This is a Node.js app run inside of an EC2 t3.micro instance with a linux AMI.
The application state (parking tickets..) is kept in a DynamoDB table in AWS. 

## How to deploy the app + resources
1) cd into the app's root directory (using cmd) and run `aws configure`
2) Fill in the necessary details (access key, region, etc.)
3) Run `./setup.sh` from the same directory as before.

## Setup.sh - what is deployed ?
The setup script bootstraps the following resources:
* An EC2 VM (t3.micro) 
* A Security Group to cover the VM (ports 22 for SSH and 3000 for application are opened strictly to IP of machine running setup.sh)
* A DynamoDB table named CloudLotParkingTickets to handle persistency (to be accessed by the application) 
* A custom IAM role to be assumed by the VM, which allows Read/Write access to the table.
* The application is setup on the EC2 together with the necessary dependencies.

## Usage
After deployment was successful, you can interact with the app's api using the following endpoints:
* POST  EC2-PUBLIC-IP/entry?plate=VEHICLE-LICENSE-PLATE&parkingLot=PARKING-LOT-ID\
  Enrolls the vehicle into the chosen lot, and returns the ticket id.
  
* POST  EC2-PUBLIC-IP/exit?ticketId=PARKING-TICKET-ID\
  Returns the parking bill for the provided ticket according to time inside the lot.
