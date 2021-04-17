/**
 * A class that helps calculate parking ticket bills according to time in the lot.
 */

const moment = require('moment');

class LotBillCalculator {
	constructor() {}

	calculateBill(entryDate, exitDate) {
		console.log(`entry date = ${entryDate}. exit date = ${exitDate}`);
		const minDiff = getMinuteDiff(exitDate, entryDate);
		const quarterHourUnits = Math.round(minDiff / 15);
		const bill = quarterHourUnits * 2.5 + 2.5;

		console.log(`LotBillCalculator - bill is ${bill}`);
		return bill;
	}
}

function getMinuteDiff(fstDate, sndDate) {
	return moment(fstDate).diff(moment(sndDate), 'minutes');
}

module.exports = LotBillCalculator;
