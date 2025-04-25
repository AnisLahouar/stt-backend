require("dotenv").config();

const { log } = require("./app/core/logger.config");
const app = require("./app/server");

const API_PORT = process.env.API_PORT;

app.listen(API_PORT, () => {
  log.info("server is working on port :", API_PORT);
  console.log("server is working on port :", API_PORT);
});
