const AWS = require('aws-sdk');

class VehicleLotTicketRepository {
	constructor() {
		AWS.config.update({ region: 'us-east-2' });
		this.ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
		this.tableName = 'CloudLotTickets';
	}

	async getVehicleLotTicket(ticketId) {
		const params = {
			TableName: this.tableName,
			Key: { S: ticketId }
		};

		return this.ddb.getItem(params).promise();
	}

	async addOrUpdateVehicleLotTicket(ticket) {
		const params = {
			TableName: this.tableName,
			Item: {
				id: { S: ticket.id },
				plate: { S: ticket.plate },
				parkingLotId: { S: ticket.parkingLotId },
				timeOfEntry: { S: ticket.timeOfEntry.toString() },
				timeOfExit: { S: ticket.timeOfExit === null ? null : ticket.timeOfExit.toString() },
				status: { S: ticket.status }
			}
		};

		await this.ddb.putItem(params).promise();
	}
}

module.exports = VehicleLotTicketRepository;
