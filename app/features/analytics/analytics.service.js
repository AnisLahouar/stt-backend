const { GlobalAnalytics } = require("../../database/models/globalAnalytics.model");
const ResHandler = require("../../helpers/responseHandler.helper");

exports.addPendingPropertyCreation = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingRequests++;

    await analytics.save();

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

exports.acceptPendingPropertyCreation = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingRequests--;

    await analytics.save();

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

exports.addPendingReservationRequest = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations++;

    await analytics.save();

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

exports.acceptPendingReservationRequest = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations--;

    await analytics.save();

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


exports.deletePendingReservationRequest = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations--;

    await analytics.save();

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
