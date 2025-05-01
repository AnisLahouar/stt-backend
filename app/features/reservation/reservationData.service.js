const { ReservationDate } = require("../../database")

exports.createDates = async (reservationId, inDates) => {
	try {

		const dates = await ReservationDate.bulkCreate(convertToSQLDate(reservationId, inDates))

		return {
			status: true,
			dates: dates
		}
	}
	catch (error) {
		return {
			status: false,
			dates: error
		}
	}
}

exports.replaceDates = async (inReservationId, inDates) => {
	try {

		const oldDates = await ReservationDate.findAll({
			where: { reservationId: inReservationId }
		})

		for (let index = 0; index < oldDates.length; index++) {
			const element = oldDates[index];
			await element.destroy()
		}

		const dates = await ReservationDate.bulkCreate(convertToSQLDate(inReservationId, inDates))

		return {
			status: true,
			dates: dates
		}
	}
	catch (error) {
		return {
			status: false,
			dates: error
		}
	}
}

exports.deleteDates = async (inReservationId) => {
	try {

		const dates = await ReservationDate.findAll({
			where: { reservationId: inReservationId }
		})

		for (let index = 0; index < dates.length; index++) {
			const element = dates[index];
			await element.destroy()
		}

		return {
			status: true,
			dates: []
		}
	}
	catch (error) {
		return {
			status: false,
			dates: error
		}
	}
}

function convertToSQLDate(inReservationId, inDates) {
	let result = [];
	for (let index = 0; index < inDates.length; index++) {
		const element = inDates[index];
		result.push({
			reservationId: inReservationId,
			date: element
		})
	}
	return result;
}