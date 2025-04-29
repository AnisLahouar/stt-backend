const { RES_MESSAGES } = require("../../core/variables.constants");
const { PropertyImage } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");


exports.create = async (property, fileName) => {
	// const resHandler = new ResHandler(res);
	try {
		const imageData = await PropertyImage.create({
			propertyId: property.id,
			imageUrl: fileName
		})

		return {
			staus: true,
			message: RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL
		}
	}
	catch (error) {
		return {
			staus: false,
			message: RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL
		}
	}
}