const { RES_MESSAGES } = require("../core/variables.constants");
const { Property } = require('../database')
const { HttpStatus } = require("../core/http_status.constants");
const ResHandler = require("../helpers/responseHandler.helper");


exports.create = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const property = await Property.create(req.body)
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
			property
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
		const properties = await Property.findAll();
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.FOUND,
				property
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {

			property = req.body

			await property.update();
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
				{}
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);

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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {
			await property.destroy();
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.DELETED,
				{}
			);
		}

		return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);

	}
	catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};