const { ROLES } = require("./variables.constants");
const sqlConfig = require("./sql.config");
const mongoConfig = require("./mongo.config");
const { HttpStatus } = require("./http_status.constants");

module.exports = {
  ROLES: ROLES,
  HTTP_STATUS : HttpStatus,
  sqlConfig: sqlConfig,
  mongoConfig:mongoConfig
};
