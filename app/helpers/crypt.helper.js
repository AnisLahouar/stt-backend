const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashPassword = async (password) => {
  let hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

exports.comparePassword = async (password, hash) => {
  let result = await bcrypt.compare(password, hash);
  return result;
};

