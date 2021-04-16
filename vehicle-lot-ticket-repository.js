const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const REGION = 'us-east-2';

class VehicleLotTicketRepository {
	constructor() {
		AWS.config.update({ region: 'us-east-2' });
		this.dbclient = new DynamoDBClient({ region: REGION });
		this.tableName = 'CloudLotTickets';
	}

	async getVehicleLotTicket(ticketId) {
		const params = {
			TableName: this.tableName,
			Key: {
				id: { S: ticketId }
			}
		};

		const item = await this.dbclient.send(new GetItemCommand(params));
		return item;
	}

	async addOrUpdateVehicleLotTicket(ticket) {
		const params = {
			TableName: this.tableName,
			Item: {
				id: { S: ticket.id },
				plate: { S: ticket.plate },
				parkingLotId: { S: ticket.parkingLotId },
				timeOfEntry: { S: ticket.timeOfEntry.toString() },
				timeOfExit: { S: ticket.timeOfExit.toString() },
				status: { S: ticket.status }
			}
		};

		console.log(JSON.stringify(params.Item));
		try {
			await this.dbclient.send(new PutItemCommand(params));
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = VehicleLotTicketRepository;
