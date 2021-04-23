/*
An API Controller dedicated to ping tests with the EC2 infra running the service.
*/

const express = require('express');
const router = express.Router();
const timeLog = require('./middleware').timeLog;

// logging middleware.
router.use(timeLog);

router.get('/', function(req, res) {
	res.status(200).send({ status: 'ok', description: 'ping test route, ping successful' });
});

module.exports = router;
