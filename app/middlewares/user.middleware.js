const { HTTP_STATUS } = require("../core");
const { RES_MESSAGES, JWTSECRET } = require("../core/variables.constants");
const { User } = require("../database");
const { checkToken } = require("../helpers/jwt.helper");
const { logErrorResponse } = require("../helpers/log.helper");
const ResHandler = require("../helpers/responseHandler.helper");

exports.userIdMiddleware = async (req, res, next) => {
  console.log(req.headers)

  const token = req.headers["authorization"] || req.headers["Authorization"];
  // console.log(token);
  
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  // console.log(authHeader);


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

  const token = req.headers["authorization"] || req.headers["Authorization"];

  if (!token) {
    console.log(req.headers)
  }

  // console.log(token);
  
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  // console.log(authHeader);


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
