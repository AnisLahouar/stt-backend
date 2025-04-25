const { RES_MESSAGES } = require("../core/variables.constants");
const { Reservation } = require('../database')
const { HttpStatus } = require("../core/http_status.constants");
const ResHandler = require("../helpers/responseHandler.helper");


exports.create = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.create(req.body)
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.CREATED,
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
		const properties = await Reservation.findAll();
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.FOUND_ALL,
			properties
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

			reservation = req.body

			await reservation.update();
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.RESERVATION.SUCCESS.UPDATED,
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

exports.delete = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			await reservation.destroy();
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