const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const VehicleLotTicketRepository = require('./vehicle-lot-ticket-repository');
const LotBillCalculator = require('./lot-bill-calculator');
const vehicleTicketRepository = new VehicleLotTicketRepository();
const lotBillCalculator = new LotBillCalculator();

// logging middleware.
router.use(function timeLog(req, res, next) {
	console.log(`Time: ${Date.now()}, Request: ${req}`);
	next();
});

// define the home page route
router.post('/entry', async function(req, res) {
	if (!isValidEntryRequest(req)) {
		res.send({
			status: 400,
			msg: 'Bad Request. Need to include license plate and parking lot id as query params.'
		});
	}

	// generate new ticket.
	const ticket = {
		id: uuidv4(),
		plate: req.query.plate,
		parkingLotId: req.query.parkingLotId,
		timeOfEntry: Date.now(),
		timeOfExit: 'null',
		status: 'Open'
	};

	// save entry details to db.
	await vehicleTicketRepository.addOrUpdateVehicleLotTicket(ticket);

	res.send({
		status: 200,
		msg: `Vehicle entered lot`,
		ticket: ticket
	});
});

// define the about route
router.post('/exit', async function(req, res) {
	if (!isValidExitRequest(req)) {
		res.send({
			status: 400,
			msg: `Bad Request. Need to include ticket id as query param.`
		});
	}

	const vehicleExitTime = Date.now();
	const ticketId = req.query.ticketId;

	// fetch ticket
	const existingTicket = await vehicleTicketRepository.getVehicleLotTicket(ticketId);

	// validate ticket
	if (isUndefinedOrNull(existingTicket)) {
		res.send({
			status: 400,
			msg: `Bad Request. The ticket with id ${ticketId} does not exist in repository.`
		});
	}

	// calculate bill
	const bill = lotBillCalculator.calculateBill(ticket.timeOfEntry, vehicleExitTime);

	const closedTicket = {
		id: existingTicket.id,
		plate: existingTicket.plate,
		parkingLotId: existingTicket.parkingLotId,
		timeOfEntry: existingTicket.timeOfEntry,
		timeOfExit: vehicleExitTime,
		status: 'Closed'
	};

	// close ticket in repository.
	await vehicleTicketRepository.addOrUpdateVehicleLotTicket(closedTicket);

	res.send({
		status: 200,
		msg: `Vehicle exited the lot successfully`,
		ticket: closedTicket,
		bill: bill
	});
});

function isValidEntryRequest(req) {
	return !isUndefinedOrNull(req.query.plate) && !isUndefinedOrNull(req.query.parkingLot);
}

function isValidExitRequest(req) {
	return !isUndefinedOrNull(req.query.ticketId);
}

function isUndefinedOrNull(param) {
	return typeof param === 'undefined' || param === null;
}

module.exports = router;
