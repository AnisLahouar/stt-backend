const { HTTP_STATUS } = require("../core");
const { RES_MESSAGES, JWTSECRET } = require("../core/variables.constants");
const { logErrorResponse } = require("../helpers/log.helper");
const ResHandler = require("../helpers/responseHandler.helper");

exports.createUserRoleMiddleware = ({
  roles
}) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (roles.includes(userRole)) {
        return next();
      }
      throw new Error("ROLE MISMATCH")

    } catch (error) {
      resHandler.setError(
        HTTP_STATUS.UNAUTHORIZED,
        RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
      );
      logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
      return resHandler.send(res);
    }
  }
};

exports.isSuperAdminMiddleware = async (req, res, next) => {
  const resHandler = new ResHandler();
  try {
    if (req.user && req.user.role == 'superAdmin') {
      next();
    } else
      throw new Error("ROLE MISMATCH")
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};


exports.isAdminMiddleware = async (req, res, next) => {
  const resHandler = new ResHandler();
  try {
    if (req.user && req.user.role == 'admin') {
      next();
    } else
      throw new Error("ROLE MISMATCH")
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};


exports.isClientMiddleware = async (req, res, next) => {
  const resHandler = new ResHandler();
  try {
    if (req.user && req.user.role == 'client') {
      next();
    } else
      throw new Error("ROLE MISMATCH")
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};


exports.isOwnerMiddleware = async (req, res, next) => {
  const resHandler = new ResHandler();
  try {
    if (req.user && req.user.role == 'owner') {
      next();
    } else
      throw new Error("ROLE MISMATCH")
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};