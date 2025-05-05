const { RES_MESSAGES } = require("../../core/variables.constants");
const { Property, User, sequelize } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");

const ResHandler = require("../../helpers/responseHandler.helper");
const { createImageData, UploadFile } = require("../propertyImage/propertyImage.service");


exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	const transaction1 = await sequelize.transaction()
	const transaction2 = await sequelize.transaction()
	let tempProperty;
	try {
		let property = req.body.property;
		const user = await User.findByPk(property.ownerId);
		if (!user) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
			return resHandler.send(res)
		}

		property = await Property.create(property)
		tempProperty = property;

		const filesUrl = []
		const files = req.files.filter((file) => file.fieldname === "images")
		const filesPromises = files.map(async element => {
			const index = files.indexOf(element)
			const resultPath = await UploadFile(element, 'property', `${property.id}_${index}`)
			filesUrl.push(resultPath)
		})
		await Promise.all(filesPromises)

		const imagesData = [];
		const dataPromises = filesUrl.map(async element => {
			const { status, result } = await createImageData(property, element, transaction2)
			if (status)
				imagesData.push(result)
		})
		await Promise.all(dataPromises)

		await transaction1.commit()
		await transaction2.commit()

		user.propertyCount++;

		await user.update();

		const result = {...property, imagesData};

		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
			result
		);
		return resHandler.send(res)
	} catch (error) {
		await transaction1.rollback()
		await transaction2.rollback()
		await tempProperty.destroy()
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
		const properties = await Property.findAll();
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
			properties
		);
		return resHandler.send(res)
	} catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};

exports.findByOwner = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const properties = await Property.findAll({
			where: {
				ownerId: req.params.id
			}
		});
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
			properties
		);
		return resHandler.send(res)
	} catch (error) {
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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {
			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.FOUND,
				property
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {

			const user = await User.findByPk(req.body.ownerId);

			if (!user) {
				resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
				return resHandler.send(res)
			}

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
			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
				property
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
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
		const property = await Property.findByPk(req.params.id);

		if (property !== null && property !== undefined) {

			const user = await User.findByPk(req.body.ownerId);

			if (!user) {
				resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
				return resHandler.send(res)
			}

			await property.destroy();

			user.propertyCount--;

			await user.update();

			resHandler.setSuccess(
				HttpStatus.OK,
				RES_MESSAGES.PROPERTY.SUCCESS.DELETED,
				{}
			);
			return resHandler.send(res)
		}

		resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
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
