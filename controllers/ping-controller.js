/*
An API Controller dedicated to ping tests with the EC2 infra running the service.
*/

const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	res.status(200).send({ status: 'ok', description: 'ping test route, ping successful' });
});

module.exports = router;
