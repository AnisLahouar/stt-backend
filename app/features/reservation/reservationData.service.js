const { ReservationDate } = require("../../database")
const { toMySQLDate, formatMySQLDate } = require("../../helpers/date.helper")

exports.createDates = async (reservationId, inDates) => {
	try {

		const dates = await ReservationDate.bulkCreate(convertToSQLDate(reservationId, inDates))

		return revertFromSQLDate(dates)

	}
	catch (error) {
		throw new Error("Create Dates Failed")
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
		result.push({
			date: formatMySQLDate(inDates[index].date)
		})
	}
	return result;
}

function convertToSQLDate(inReservationId, inDates) {
	let result = [];
	for (let index = 0; index < inDates.length; index++) {
		result.push({
			reservationId: inReservationId,
			date: toMySQLDate(inDates[index])
		})
	}
	return result;
}