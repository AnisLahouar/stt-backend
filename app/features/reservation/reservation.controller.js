const { RES_MESSAGES } = require("../../core/variables.constants");
const { Reservation } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");
const ResHandler = require("../../helpers/responseHandler.helper");
const { createDates, replaceDates, deleteDates } = require("./reservationData.service");


exports.create = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.create(req.body.reservation)

		const { status, dates } = createDates(reservation.id, req.body.dates);

		if (!status)
			throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_CREATE);

		reservation.dates = dates;

		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.CREATED,
			reservation
		);
	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		)
	}
}

exports.findAll = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservations = await Reservation.findAll();
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.FOUND_ALL,
			reservations
		);
	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.findOne = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservation
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);
	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.findByPhone = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservations = await Reservation.findAll({
			where: {
				clientPhone: req.params.phone
			}
		});

		if (reservations !== null && reservations !== undefined
			&& reservations.length > 0) {
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservations
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.PHONE);
	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.findByProperty = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservations = await Reservation.findAll({
			where: {
				propertyId: req.params.id
			}
		});

		if (reservations !== null && reservations !== undefined
			&& reservations.length > 0) {
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.FOUND,
				reservations
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.PROPERTY);
	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.update = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			reservation.propertyId = req.body.propertyId
			reservation.clientName = req.body.clientName
			reservation.clientEmail = req.body.clientEmail
			reservation.clientPhone = req.body.clientPhone
			reservation.comment = req.body.comment
			reservation.status = req.body.status

			const {status, dates} = await replaceDates(reservation.id, req.body.dates)

			if (!status) throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_UPDATE)

			await reservation.update();

			reservation.dates = dates;

			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.UPDATED,
				reservation
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);

	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.delete = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			await reservation.destroy();
			
			const {status, result} = await deleteDates(req.params.id)

			if (!status) throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_DELETE)
			
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.DELETED,
				{}
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.RESERVATION.ERROR.NOT_FOUND);

	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};