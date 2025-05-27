const { RES_MESSAGES } = require("../../core/variables.constants");
const { PropertyImage } = require("../../database");
const { compressImageBuffer, saveImageToDisk } = require("../../helpers/image.helper");
const path = require('path');

exports.createImageData = async (property, fileName, inTransaction) => {
  try {
    const imageData = await PropertyImage.create({
      propertyId: property.id,
      imageUrl: fileName
    }, {
      transaction: inTransaction
    })

    return {
      status: true,
      result: imageData,
      message: RES_MESSAGES.PROPERTY_IMAGE.SUCCESS.CREATED
    }
  }
  catch (error) {
    throw new Error("Create Image Data Failed: " + error.message)
  }
}

exports.UploadFile = async (inImage, inPath, inName) => {
  try {
    const compressedImage = await compressImageBuffer(inImage.buffer);
    const imagePath = path.join(__dirname, `../../uploads/${inPath}`, `${inName}.jpg`);
    await saveImageToDisk(compressedImage, imagePath);
    return `uploads/${inPath}/${inName}.jpg`;
  }
  catch (e) {
    throw new Error("Image Save to Disk Failed: " + e.message);
  }
}
