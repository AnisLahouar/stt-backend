const jwt = require("jsonwebtoken");
const { JWTSECRET } = require("../core/variables.constants");



exports.createToken = (id, expiration) => {
  try {
    const token = jwt.sign({ id: id }, JWTSECRET, { expiresIn: expiration });
    return token;
  } catch (error) {
    throw "error while creating token : " + error;
  }

};

exports.checkToken = (token) => {
  try {
    var decoded = jwt.verify(token, JWTSECRET);
    return decoded;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.decodeToken = (token) => {
  try {
    var decoded = jwt.decode(token, JWTSECRET);
    return decoded;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
