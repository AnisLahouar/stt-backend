const { RES_MESSAGES } = require("../../core/variables.constants");
const { Reservation, ReservationDate, sequelize } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");
const ResHandler = require("../../helpers/responseHandler.helper");
const { createDates, replaceDates, deleteDates } = require("./reservationData.service");
const { propertyExists } = require("../property/property.service");
const { paginate } = require("../../helpers/paginate.helper");


exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	const transaction = await sequelize.transaction()
	try {
		let { propertyId, clientName, clientEmail, clientPhone, comment, status } = req.body.reservation
		const { dates } = req.body

		if (!isReservationBodyValid({ propertyId, clientName, clientEmail, clientPhone, comment, status })
			|| !isDatesBodyValid(dates)) {
			resHandler.setError(
				HttpStatus.BAD_REQUEST,
				RES_MESSAGES.MISSING_PARAMETERS,
			);
			return resHandler.send(res)
		}

		const isPropertyValid = await propertyExists(propertyId);

		if (!isPropertyValid) {
			resHandler.setError(
				HttpStatus.NOT_FOUND,
				RES_MESSAGES.INVALID_PARAMETERS,
			);
			return resHandler.send(res)
		}

		status = 'pending'
		const createdReservation = await Reservation.create({ propertyId, clientName, clientEmail, clientPhone, comment, status }, transaction)
		const createdDates = await createDates(createdReservation.id, dates);

		const result = { ...createdReservation.toJSON(), createdDates }

		await transaction.commit();
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.CREATED,
			result
		);
		return resHandler.send(res)
	}
	catch (error) {
		await transaction.rollback
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		)
		return resHandler.send(res)
	}
}

exports.findAll = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const pagination = paginate(
			req.query.page || 0,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const reservations = await Reservation.findAll({
			include: {
				model: ReservationDate,
			}, ...pagination
		});
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.FOUND_ALL,
			reservations
		);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.findOne = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const reservation = await Reservation.findByPk(req.params.id,
			{
				include: {
					model: ReservationDate,
				}
			});

		if (reservation !== null && reservation !== undefined) {
			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservation
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.findByPhone = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const pagination = paginate(
			req.query.page || 0,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const reservations = await Reservation.findAll({
			where: {
				clientPhone: req.params.phone
			},
			include: {
				model: ReservationDate,
			},
			...pagination
		});

		if (reservations !== null && reservations !== undefined
			&& reservations.length > 0) {
			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservations
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.PHONE);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.findByProperty = async (req, res) => {
	const resHandler = new ResHandler();
	try {

		const pagination = paginate(
			req.query.page || 0,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const reservations = await Reservation.findAll({
			where: {
				propertyId: req.params.id
			},
			include: {
				model: ReservationDate,
			},
			...pagination
		});

		if (reservations !== null && reservations !== undefined
			&& reservations.length > 0) {
			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservations
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.PROPERTY);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.update = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		let { propertyId, clientName, clientEmail, clientPhone, comment, status } = req.body.reservation
		const { dates } = req.body

		if (!isReservationBodyValid({ propertyId, clientName, clientEmail, clientPhone, comment, status })
			|| !isDatesBodyValid(dates)
		) {
			resHandler.setError(
				HttpStatus.BAD_REQUEST,
				RES_MESSAGES.MISSING_PARAMETERS,
			);
			return resHandler.send(res)
		}

		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			reservation.propertyId = propertyId
			reservation.clientName = clientName
			reservation.clientEmail = clientEmail
			reservation.clientPhone = clientPhone
			reservation.comment = comment
			reservation.status = status

			const createdDates = await replaceDates(reservation.id, req.body.dates)

			await reservation.update();

			const result = { ...reservation.toJSON(), createdDates }

			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.UPDATED,
				result
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.delete = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			await reservation.destroy();

			await deleteDates(req.params.id)

			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.DELETED,
				{}
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);
		return resHandler.send(res)
	}
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};



function isReservationBodyValid(inReservation) {

	if (!propertyId || !clientName || !clientEmail || !clientPhone || !comment) {
		return false
	}
	return true
}

function isDatesBodyValid(inDates) {
	if (!Array.isArray(inDates)) {
		// throw new Error("reservation must be an array");
		return false
	}

	for (const [i, r] of inDates.entries()) {
		const { propertyId, date } = r;

		if (!propertyId || !date) {
			// throw new Error(`Missing fields in reservation at index ${i}`);
			return false
		}

	}

	return true
}