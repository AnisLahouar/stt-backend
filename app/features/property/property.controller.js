const { RES_MESSAGES } = require("../../core/variables.constants");
const { Property, User } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");

const ResHandler = require("../../helpers/responseHandler.helper");


exports.create = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const user = await User.findByPk(req.body.ownerId);
		if (user === null || user === undefined)
			return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);

		const property = await Property.create(req.body)

		user.propertyCount++;

		await user.update();

		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
			property
		);
	} catch (error) {
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
	} catch (error) {
		return resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
	}
};

exports.findByOwner = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const properties = await Property.findAll({
			where: {
				ownerId: req.params.id
			}
		});
		return resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
			properties
		);
	} catch (error) {
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

			const user = await User.findByPk(req.body.ownerId);

			if (user === null || user === undefined)
				return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);

			property.ownerId = req.body.ownerId;
			property.title = req.body.title;
			property.description = req.body.description;
			property.address = req.body.address;
			property.pricePerDay = req.body.pricePerDay;
			property.pricePerMonth = req.body.pricePerMonth;
			property.adminPricePerDay = req.body.adminPricePerDay;
			property.adminPricePerMonth = req.body.adminPricePerMonth;
			property.status = req.body.status;

			await property.update();
			return resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
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

exports.delete = async (req, res) => {
	const resHandler = new ResHandler(res);
	try {
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {

			const user = await User.findByPk(req.body.ownerId);

			if (user === null || user === undefined)
				return resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);

			await property.destroy();

			user.propertyCount--;

			await user.update();

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
