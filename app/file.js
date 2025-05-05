exports.uploadImage = async (req, res) => {
  // #swagger.tags = ['User']
  const resHandler = new ResHandler(res);
  try {
    const image = req.files.filter((file) => file.fieldname === "image")[0];
    if (!image) {
      resHandler.setError(HttpStatus.BAD_REQUEST, "Image not found");
      return resHandler.send(res);
    }
    const user = await User.findByPk(req.id);

    const compressedImage = await compressImageBuffer(image.buffer);

    const imagePath = path.join(__dirname, "../../uploads/users", `${user.id}.jpg`);

    const saved = await saveImageToDisk(compressedImage, imagePath);
    console.log(saved);
    if (!saved) {
      resHandler.setError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RES_MESSAGES.USER.ERROR.ERROR_UPLOADING_IMAGE
      );
      return resHandler.send(res);
    }

    if (!user) {
      resHandler.setError(
        HttpStatus.BAD_GATEWAY,
        RES_MESSAGES.USER.ERROR.USER_NOT_FOUND
      );
      return resHandler.send(res);
    }
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.IMAGE_UPDATED,
      {}
    );

    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};