/**
 * Application Entrypoint.
 */

const express = require('express');
const rootController = require('./controllers/lot-controller');
const pingController = require('./controllers/ping-controller');
const app = express();
const port = 3000;

app.use('/', rootController);
app.use('/ping', pingController);

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
