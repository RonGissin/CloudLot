const express = require('express');
const rootController = require('./root-controller');
const app = express();
const port = 3000;

app.use('/', rootController);

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
