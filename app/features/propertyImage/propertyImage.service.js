const { RES_MESSAGES } = require("../../core/variables.constants");
const { PropertyImage } = require("../../database");
const { compressImageBuffer, saveImageToDisk } = require("../../helpers/image.helper");
const ResHandler = require("../../helpers/responseHandler.helper");

exports.createImageData = async (property, fileName, inTransaction) => {
  try {
    const imageData = await PropertyImage.create({
      propertyId: property.id,
      imageUrl: fileName
    }, {
      transaction: inTransaction
    })

    return {
      staus: true,
      result: imageData,
      message: RES_MESSAGES.PROPERTY_IMAGE.SUCCESS.CREATED
    }
  }
  catch (error) {
    throw new Error(error.message)
  }
}

exports.UploadFile = async (inImage, inPath, inName) => {
  const compressedImage = await compressImageBuffer(inImage.buffer);

  const imagePath = path.join(__dirname, `../../uploads/${inPath}`, `${inName}.jpg`);

  const saved = await saveImageToDisk(compressedImage, imagePath);
  if (!saved) {
    throw new Error("Image Save to Disk Failed");
  }
}
