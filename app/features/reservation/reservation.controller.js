const { RES_MESSAGES } = require("../../core/variables.constants");
const { Reservation, ReservationDate } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");
const ResHandler = require("../../helpers/responseHandler.helper");
const { createDates, replaceDates, deleteDates } = require("./reservationData.service");


exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const reservation = await Reservation.create(req.body.reservation)

		const { status, dates } = createDates(reservation.id, req.body.dates);

		if (!status)
			throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_CREATE);

		reservation.dates = dates;
		const result = { ...reservation.toJSON(), dates }

		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.RESERVATION.SUCCESS.CREATED,
			result
		);
		return resHandler.send(res)
	}
	catch (error) {
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
		const reservations = await Reservation.findAll({
			include: {
				model: ReservationDate,
			}
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
		const reservations = await Reservation.findAll({
			where: {
				clientPhone: req.params.phone
			},
			include: {
				model: ReservationDate,
			}
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
		const reservations = await Reservation.findAll({
			where: {
				propertyId: req.params.id
			},
			include: {
				model: ReservationDate,
			}
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
		const reservation = await Reservation.findByPk(req.params.id);

		if (reservation !== null && reservation !== undefined) {
			reservation.propertyId = req.body.propertyId
			reservation.clientName = req.body.clientName
			reservation.clientEmail = req.body.clientEmail
			reservation.clientPhone = req.body.clientPhone
			reservation.comment = req.body.comment
			reservation.status = req.body.status

			const { status, dates } = await replaceDates(reservation.id, req.body.dates)

			if (!status) throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_UPDATE)

			await reservation.update();

			const result = { ...reservation.toJSON(), dates }

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

			const { status, result } = await deleteDates(req.params.id)

			if (!status) throw new Error(RES_MESSAGES.RESERVATION.ERROR.DATE_DELETE)

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