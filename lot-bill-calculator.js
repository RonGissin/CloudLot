/**
 * A class that helps calculate parking ticket bills according to time in the lot.
 */

class LotBillCalculator {
	constructor() {}

	calculateBill(entryDate, exitDate) {
		console.log(`entry date = ${entryDate}. exit date = ${exitDate}`);
		const minDiff = getMinuteDiff(exitDate, entryDate);
		const quarterHourUnits = minDiff / 15;
		const bill = quarterHourUnits * 2.5;

		console.log(`LotBillCalculator - bill is ${bill}`);
		return bill;
	}
}

function getMinuteDiff(fstDate, sndDate) {
	const diffMs = parseInt(Math.abs(fstDate - sndDate));
	return Math.round(((diffMs % 86400000) % 3600000) / 60000);
}

module.exports = LotBillCalculator;
