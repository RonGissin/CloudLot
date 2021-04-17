/**
 * An API Controller to handle requests.
 */

const moment = require('moment');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const VehicleLotTicketRepository = require('./vehicle-lot-ticket-repository');
const LotBillCalculator = require('./lot-bill-calculator');
const ParkingTicketFactory = require('./parking-ticket-factory');
const vehicleTicketRepository = new VehicleLotTicketRepository();
const lotBillCalculator = new LotBillCalculator();
const parkingTicketFactory = new ParkingTicketFactory();

// logging middleware.
router.use(function timeLog(req, res, next) {
	console.log(`Time: ${Date.now()}, Request: ${req}`);
	next();
});

router.get('/', function(req, res) {
	res.send({ status: 'ok', description: 'ping test route, ping successful' });
});

// define the home page route
router.post('/entry', async function(req, res) {
	if (!isValidEntryRequest(req)) {
		res.send({
			status: 400,
			msg: 'Bad Request. Need to include license plate and parking lot id as query params.'
		});
	}

	const ticket = parkingTicketFactory.create(
		uuidv4(),
		req.query.plate,
		req.query.parkingLot,
		Date.now(),
		'null',
		'Open'
	);

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
	console.log(`existing ticket = ${JSON.stringify(existingTicket)}`);

	// validate ticket
	if (isUndefinedOrNull(existingTicket) || existingTicket.status === 'Closed') {
		res.send({
			status: 400,
			msg: `Bad Request. The ticket with id ${ticketId} does not exist in repository, or is already closed.`
		});
	}

	// calculate bill
	const bill = lotBillCalculator.calculateBill(new Date(parseInt(existingTicket.timeOfEntry)), vehicleExitTime);
	const totalParkingTime = moment.precise(vehicleExitTime - existingTicket.timeOfEntry).humanize();

	const closedTicket = parkingTicketFactory.create(
		existingTicket.id,
		existingTicket.plate,
		existingTicket.parkingLotId,
		existingTicket.timeOfEntry,
		vehicleExitTime.toString(),
		'Closed'
	);

	console.log(`closed ticket = ${JSON.stringify(closedTicket)}`);

	// close ticket in repository.
	await vehicleTicketRepository.addOrUpdateVehicleLotTicket(closedTicket);

	res.send({
		status: 200,
		msg: `Vehicle exited the lot successfully`,
		ticket: closedTicket,
		totalParkingTime: totalParkingTime,
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
