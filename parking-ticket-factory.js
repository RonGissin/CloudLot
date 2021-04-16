/**
 * A factory to create parking tickets.
 */

class ParkingTicketFactory {
	constructor() {}

	create(id, plate, parkingLotId, timeOfEntry, timeOfExit, status) {
		return {
			id: id,
			plate: plate,
			parkingLotId: parkingLotId,
			timeOfEntry: timeOfEntry,
			timeOfExit: timeOfExit,
			status: status
		};
	}
}

module.exports = ParkingTicketFactory;
