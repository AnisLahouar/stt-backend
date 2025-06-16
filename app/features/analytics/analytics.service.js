const { GlobalAnalytics } = require("../../database/models/globalAnalytics.model");
const ResHandler = require("../../helpers/responseHandler.helper");

exports.addPendingPropertyCreation = async () => {
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingRequests++;

    await analytics.save();

    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

exports.acceptPendingPropertyCreation = async () => {
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingRequests--;

    await analytics.save();

    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

exports.addPendingReservationRequest = async () => {
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations++;

    await analytics.save();

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}

exports.acceptPendingReservationRequest = async () => {
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations--;

    await analytics.save();

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}


exports.deletePendingReservationRequest = async () => {
  const resHandler = new ResHandler(res);
  try {
    const analytics = await GlobalAnalytics.findOne();

    analytics.pendingReservations--;

    await analytics.save();

    return true;

  } catch (error) {
    console.log(error);
    return false
  }
}
