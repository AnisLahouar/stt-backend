const { RES_MESSAGES } = require("../../core/variables.constants");
const { Reservation, ReservationDate, sequelize } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");
const ResHandler = require("../../helpers/responseHandler.helper");
const { createDates, replaceDates, deleteDates } = require("./reservationData.service");
const { propertyExists } = require("../property/property.service");
const { paginate } = require("../../helpers/paginate.helper");
const { sanitizeSearchInput } = require("../../helpers/search.helper");
const { Op } = require("sequelize");


exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	const transaction = await sequelize.transaction()
	let createdReservation;
	try {
		let { propertyId, clientName, clientEmail, clientPhone, comment } = req.body
		const { dates } = req.body

		if (!isReservationBodyValid({ propertyId, clientName, clientEmail, clientPhone, comment })
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

		createdReservation = await Reservation.create({ propertyId, clientName, clientEmail, clientPhone, comment, status: 'pending' }
			, {
				// transaction: transaction,
				raw: true
			}
		)

		console.log("Created Reservation Id: " + createdReservation.id);

		const createdDates = await createDates(createdReservation.id, dates, transaction);

		const result = { ...createdReservation.toJSON(), createdDates }

		console.log("READY TO COMMIT");

		await transaction.commit();
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.CREATED,
			result
		);
		return resHandler.send(res)
	}
	catch (error) {
		await createdReservation.destroy()
		await transaction.rollback()
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
			req.query.page > 1 ? req.query.page : 1,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const whereClause = req.query
			? {
				...(req.query.propertyId && { propertyId: { [Op.like]: `%${req.query.propertyId}%` } }),
				...(req.query.clientName && { clientName: { [Op.like]: `%${req.query.clientName}%` } }),
				...(req.query.clientEmail && { clientEmail: { [Op.like]: `%${req.query.clientEmail}%` } }),
				...(req.query.clientPhone && { clientPhone: { [Op.like]: `%${req.query.clientPhone}%` } }),
				...(req.query.comment && { comment: { [Op.like]: `%${req.query.comment}%` } }),
				...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
			}
			: {};


		const reservations = await Reservation.findAndCountAll({
			include: {
				model: ReservationDate,
			}, ...pagination, where: whereClause
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
			req.query.page > 1 ? req.query.page : 1,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const whereClause = req.query
			? {
				...(req.query.propertyId && { propertyId: { [Op.like]: `%${req.query.propertyId}%` } }),
				...(req.query.clientName && { clientName: { [Op.like]: `%${req.query.clientName}%` } }),
				...(req.query.clientEmail && { clientEmail: { [Op.like]: `%${req.query.clientEmail}%` } }),
				// ...(req.query.clientPhone && { clientPhone: { [Op.like]: `%${req.query.clientPhone}%` } }),
				...(req.query.comment && { comment: { [Op.like]: `%${req.query.comment}%` } }),
				...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
			}
			: {};


		const reservations = await Reservation.findAndCountAll({
			where: {
				clientPhone: req.params.phone
			},
			include: {
				model: ReservationDate,
			},
			...pagination, where: whereClause
		});

		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
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

exports.findByProperty = async (req, res) => {
	const resHandler = new ResHandler();
	try {

		const pagination = paginate(
			req.query.page > 1 ? req.query.page : 1,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const whereClause = req.query
			? {
				// ...(req.query.propertyId && { propertyId: { [Op.like]: `%${req.query.propertyId}%` } }),
				...(req.query.clientName && { clientName: { [Op.like]: `%${req.query.clientName}%` } }),
				...(req.query.clientEmail && { clientEmail: { [Op.like]: `%${req.query.clientEmail}%` } }),
				...(req.query.clientPhone && { clientPhone: { [Op.like]: `%${req.query.clientPhone}%` } }),
				...(req.query.comment && { comment: { [Op.like]: `%${req.query.comment}%` } }),
				...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
			}
			: {};

		const reservations = await Reservation.findAndCountAll({
			where: {
				propertyId: req.params.id
			},
			include: {
				model: ReservationDate,
			},
			...pagination, where: whereClause
		});

		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
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
	if (!inReservation.propertyId || !inReservation.clientName ||
		!inReservation.clientEmail || !inReservation.clientPhone ||
		!inReservation.comment) {
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