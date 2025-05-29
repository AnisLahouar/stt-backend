const { HTTP_STATUS } = require("../core");
const { RES_MESSAGES, JWTSECRET } = require("../core/variables.constants");
const { User } = require("../database");
const { checkToken } = require("../helpers/jwt.helper");
const { logErrorResponse } = require("../helpers/log.helper");
const ResHandler = require("../helpers/responseHandler.helper");

exports.userIdMiddleware = async (req, res, next) => {
  const authHeader = req.headers["Authorization"];
  const token = authHeader;
  // const token = authHeader && authHeader.split(" ")[1];
  // const token = req.headers["Authorization"];

  const resHandler = new ResHandler();
  if (!token) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.NO_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.NO_TOKEN);
    return resHandler.send(res);
  }
  try {
    const decoded = checkToken(token, JWTSECRET);
    const { id } = decoded;
    req.id = id;
    next();
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};

exports.userMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader;
  // const token = authHeader && authHeader.split(" ")[1];
  // const token = req.headers["Authorization"];

  console.log(req.headers)
  console.log(authHeader);
  console.log(token);


  const resHandler = new ResHandler();
  if (!token) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.NO_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.NO_TOKEN);
    return resHandler.send(res);
  }
  try {
    const decoded = checkToken(token, JWTSECRET);
    const { id } = decoded;
    const user = await User.findByPk(id);
    req.user = user;
    next();
  } catch (error) {
    resHandler.setError(
      HTTP_STATUS.UNAUTHORIZED,
      RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN
    );
    logErrorResponse(req, req.id, RES_MESSAGES.AUTH.ERROR.INVALID_TOKEN);
    return resHandler.send(res);
  }
};