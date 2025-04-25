const { HTTP_STATUS } = require("../../core");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { sequelize } = require("../../database/mysql");
const { resHandler } = require("../../helpers");
const { uploadImageToCDN } = require("../../helpers/http.helper");
const { logRequest, logErrorResponse } = require("../../helpers/log.helper");
const {
  checkClient,
  createClient,
  createResitrationCode,
} = require("./client.service");

exports.createClient = async (req, res) => {
  // #swagger.tags = ['Client']
  const t = await sequelize.transaction();
  const {
    firstname,
    lastname,
    birthdate,
    sex,
    gov_id,
    email,
    is_legal_representative,
    physical_address,
    phone_number,
    primary_lang,
    secondary_lang,
  } = req.body;
  if (
    !firstname ||
    !lastname ||
    !birthdate ||
    !sex ||
    !gov_id ||
    !email ||
    !is_legal_representative ||
    !physical_address ||
    !phone_number ||
    !primary_lang ||
    !secondary_lang
  ) {
    resHandler.setError(400, RES_MESSAGES.MISSING_PARAMETERS);
    logErrorResponse(req, req.id, RES_MESSAGES.MISSING_PARAMETERS);
    return resHandler.send(res);
  }
  try {
    const exist = await checkClient(gov_id);
    if (exist) {
      resHandler.setError(400, RES_MESSAGES.CLIENT.ERROR.CLIENT_EXIST);
      logErrorResponse(req, req.id, RES_MESSAGES.CLIENT.ERROR.CLIENT_EXIST);
      return resHandler.send(res);
    }
    const newUserInputs = {
      registration_number: await createResitrationCode({ firstname, lastname }),
      firstname: firstname,
      lastname: lastname,
      birthdate: birthdate,
      sex: sex,
      gov_id: gov_id,
      email: email,
      is_legal_representative,
      physical_address: physical_address,
      phone_number: phone_number,
      primary_lang: primary_lang,
      secondary_lang: secondary_lang,
    };

    const newUser = await createClient(newUserInputs, t);
    await uploadImageToCDN(req.file, newUser.id);
    await t.commit();
    resHandler.setSuccess(
      200,
      RES_MESSAGES.CLIENT.SUCCESS.CLIENT_CREATED_SUCCESSFULLY,
      newUser
    );
    logRequest(req, req.id, newUser);
    return resHandler.send(res);
  } catch (error) {
    logErrorResponse(req, req.id, error);
    await t.rollback();
    resHandler.setError(
      500,
      RES_MESSAGES.CLIENT.ERROR.ERROR_WHILE_CREATING_CLIENT
    );
    return resHandler.send(res);
  }
};

exports.getClient = async (req, res) => {
  // #swagger.tags = ['Client']
  const  user  = req.user;
  if (!user) {
    resHandler.setError(HTTP_STATUS.BAD_REQUEST, RES_MESSAGES.CLIENT.ERROR.ERROR_WHILE_GETTING_CLIENT);
    logErrorResponse(req, req.id, RES_MESSAGES.CLIENT.ERROR.ERROR_WHILE_GETTING_CLIENT);
    return resHandler.send(res);
  } else {
    resHandler.setSuccess(HTTP_STATUS.OK, RES_MESSAGES.CLIENT.SUCCESS.CLIENT_RETRIEVED_SUCCESSFULLY, user);
    logRequest(req, req.id, user);
    return resHandler.send(res);
  }
}
