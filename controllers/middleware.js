/*
HTTP request middleware functions.
*/

function timeLog(req, res, next) {
	console.log(`Time: ${Date.now()}, Request: ${JSON.stringify(req)}`);
	next();
}

module.exports = {
	timeLog
};
