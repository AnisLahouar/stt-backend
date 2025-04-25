const { log } = require("../core/logger.config");

exports.logRequest = (req, id, res) => {
  log.info(`REQUEST : METHOD = ${req.method}  ${id ? `- id : ${id} ` : "public api"} - path : ${req.originalUrl} - user-agent = ${req.headers["user-agent"]} - params = ${JSON.stringify( req.params)} - query = ${JSON.stringify(req.query)} - body = ${JSON.stringify(req.body)} // RESPONSE = ${JSON.stringify(res)}`);
};

exports.logErrorResponse = (req,id,error) => {
  log.error(`REQUEST : METHOD = ${req.method}  ${id ? `- id : ${id} ` : "public api"} - path : ${req.originalUrl} - user-agent = ${req.headers["user-agent"]} - params = ${JSON.stringify(req.params)} - query = ${JSON.stringify(req.query)} - body = ${JSON.stringify(req.body)} // RESPONSE = ${error}`);
};
