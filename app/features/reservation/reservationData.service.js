const { ReservationDate } = require("../../database")
const { toMySQLDate, formatMySQLDate } = require("../../helpers/date.helper")

exports.createDates = async (reservationId, inDates, transaction) => {
	try {

		const input = convertToSQLDate(reservationId, inDates)
		// console.log(input);
		const dates = await ReservationDate.bulkCreate(input
			, {
				// transaction: transaction,
				raw: true
			}
		)
		// console.log(dates);
		return revertFromSQLDate(dates)

	}
	catch (error) {
		throw new Error("Create Dates Failed" + error.message)
	}
}

exports.replaceDates = async (inReservationId, inDates) => {
	try {

		const oldDates = await ReservationDate.findAll({
			where: { reservationId: inReservationId }
		})

		await Promise.all(oldDates.map(async element => await element.destroy()));

		const dates = await ReservationDate.bulkCreate(convertToSQLDate(inReservationId, inDates))

		return revertFromSQLDate(dates)
	}
	catch (error) {

		throw new Error("Update Dates Failed")
	}
}

exports.deleteDates = async (inReservationId) => {
	try {

		const dates = await ReservationDate.findAll({
			where: { reservationId: inReservationId }
		})

		await Promise.all(dates.map(async element => await element.destroy()));

		return []
	}
	catch (error) {
		throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_DELETE)
	}
}

function revertFromSQLDate(inDates) {
	let result = [];
	for (let index = 0; index < inDates.length; index++) {
		console.log(inDates[index].date);
		result.push({
			date: formatMySQLDate(inDates[index].date, "YYYY-MM-DD")
		})
	}
	return result;
}

function convertToSQLDate(inReservationId, inDates) {
	let result = [];
	for (let index = 0; index < inDates.length; index++) {
		result.push({
			reservationId: inReservationId,
			date: toMySQLDate(inDates[index].date)
		})
	}
	return result;
}