const { RES_MESSAGES } = require("../../core/variables.constants");
const { PropertyImage } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");


exports.createImageData = async (property, fileName) => {
	try {
		const imageData = await PropertyImage.create({
			propertyId: property.id,
			imageUrl: fileName
		})

		return {
			staus: true,
			result: imageData,
			message: RES_MESSAGES.PROPERTY_IMAGE.SUCCESS.CREATED
		}
	}
	catch (error) {
		return {
			staus: false,
			message: error.message
		}
	}
}
