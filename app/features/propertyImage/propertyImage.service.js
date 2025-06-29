const { RES_MESSAGES } = require("../../core/variables.constants");
const { PropertyImage } = require("../../database");
const { deleteFile } = require("../../helpers/file.helper");
const { compressImageBuffer, saveImageToDisk } = require("../../helpers/image.helper");
const path = require('path');


//image at index 0 in create -> default
// in update: use IDs
exports.createImageData = async (property, fileName, index, inTransaction) => {
  try {
    const imageData = await PropertyImage.create({
      propertyId: property.id,
      imageUrl: fileName,
      isDefault: index == 0
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
    console.log("Error Occured Creating Image Data: " + error.message);
    return {
      status: false,
    }
    // throw new Error("Create Image Data Failed: " + error.message)
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

exports.deleteImageFile = async (inPath) => {
  try {
    // const imagePath = path.join(__dirname, `../../uploads/${inPath}`, `${inName}.jpg`);
    await deleteFile(inPath);
    return `Deleted File At: ${inPath}`;
  }
  catch (e) {
    throw new Error("Image Save to Disk Failed: " + e.message);
  }
}