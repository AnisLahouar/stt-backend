const { GlobalAnalytics } = require("../../database/models/globalAnalytics.model");
const ResHandler = require("../../helpers/responseHandler.helper");

exports.getGeneralAnalytics = async (req, res) => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.AUTH.SUCCESS.USER_CREATED,
      analytics
    )
    return resHandler.send(res);

  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
}