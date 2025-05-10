const { RES_MESSAGES } = require("../../core/variables.constants");
const { Property, User, sequelize } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");

const ResHandler = require("../../helpers/responseHandler.helper");
const { createImageData, UploadFile } = require("../propertyImage/propertyImage.service");
const { paginate } = require("../../helpers/paginate.helper");


exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	const transaction1 = await sequelize.transaction()
	let tempProperty;
	try {
		let { ownerId, title, description, address, pricePerDay, pricePerMonth, adminPricePerDay, adminPricePerMonth, status } = req.body;

		if (!isPropertyDataValid()) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
			return resHandler.send(res)
		}

		const user = await User.findByPk(ownerId);
		if (!user) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
			return resHandler.send(res)
		}

		const property = await Property.create({ ownerId, title, description, address, pricePerDay, pricePerMonth, adminPricePerDay, adminPricePerMonth, status: 'pending' })
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
			const { status, result } = await createImageData(property, element, transaction1)
			if (status)
				imagesData.push(result)
		})
		await Promise.all(dataPromises)

		await transaction1.commit()

		user.propertyCount++;

		await user.update();

		const result = { ...property, imagesData };

		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
			result
		);
		return resHandler.send(res)
	} catch (error) {
		await transaction1.rollback()
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
		const pagination = paginate(
			req.query.page > 1 ? req.query.page : 1,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);


		const properties = await Property.findAndCountAll({ ...pagination });
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

		const pagination = paginate(
			req.query.page > 1 ? req.query.page : 1,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const properties = await Property.findAndCountAll({
			where: {
				ownerId: req.params.id
			},
			...pagination
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

		if (!property) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
			return resHandler.send(res)
		}

		let { ownerId, title, description, address, pricePerDay, pricePerMonth, adminPricePerDay, adminPricePerMonth, status } = req.body;

		if (!isPropertyDataValid()) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
			return resHandler.send(res)
		}

		const user = await User.findByPk(ownerId);

		if (!user) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
			return resHandler.send(res)
		}

		property.ownerId = ownerId;
		property.title = title;
		property.description = description;
		property.address = address;
		property.pricePerDay = pricePerDay;
		property.pricePerMonth = pricePerMonth;
		property.adminPricePerDay = adminPricePerDay;
		property.adminPricePerMonth = adminPricePerMonth;
		property.status = status;

		await property.update();
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
			property
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

exports.delete = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const property = await Property.findByPk(req.params.id);

		if (!property) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
			return resHandler.send(res)
		}

		const { ownerId } = req.body;
		if (!ownerId) {
			resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
			return resHandler.send(res)
		}

		const user = await User.findByPk(ownerId);

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
	catch (error) {
		resHandler.setError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			`${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
		);
		return resHandler.send(res)
	}
};


function isPropertyDataValid(inProperty) {
	if (!inProperty.ownerId || !inProperty.title || !inProperty.description || !inProperty.address || !inProperty.pricePerDay || !inProperty.pricePerMonth || !inProperty.adminPricePerDay || !inProperty.adminPricePerMonth || !inProperty.status)
		return false
	return true
}