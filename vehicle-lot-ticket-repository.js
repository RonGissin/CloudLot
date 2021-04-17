/**
 * Repository to communicate with AWS DynamoDB table.
 */

const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const REGION = 'us-east-2';

class VehicleLotTicketRepository {
	constructor() {
		this.dbclient = new DynamoDB({ region: REGION });
		this.tableName = 'CloudLotParkingTickets';
	}

	async getVehicleLotTicket(ticketId) {
		const params = {
			TableName: this.tableName,
			Key: marshall({
				id: ticketId
			})
		};

		let item = null;

		try {
			item = await this.dbclient.getItem(params);
		} catch (e) {
			console.log(e);
		}

		return unmarshall(item.Item);
	}

	async addOrUpdateVehicleLotTicket(ticket) {
		const params = {
			TableName: this.tableName,
			Item: marshall({
				id: ticket.id,
				plate: ticket.plate,
				parkingLotId: ticket.parkingLotId,
				timeOfEntry: ticket.timeOfEntry.toString(),
				timeOfExit: ticket.timeOfExit.toString(),
				status: ticket.status
			})
		};

		console.log(JSON.stringify(params.Item));
		try {
			await this.dbclient.putItem(params);
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = VehicleLotTicketRepository;
