class LotBillCalculator {
	constructor() {}

	calculateBill(entryDate, exitDate) {
		const minDiff = getMinuteDiff(exitDate, entryDate);
		const quarterHourUnits = minDiff / 15;
		const bill = quarterHourUnits * 2.5;

		console.log(`LotBillCalculator - bill is ${bill}`);
		return bill;
	}
}

function getMinuteDiff(fstDate, sndDate) {
	const diffMs = Math.abs(fstDate - sndDate);
	return Math.round(((diffMs % 86400000) % 3600000) / 60000);
}

module.exports = LotBillCalculator;
