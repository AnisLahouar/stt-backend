const { Sequelize } = require("sequelize");
const { sqlConfig } = require("../core");
const { log } = require("../core/logger.config");

const sequelize = new Sequelize(
  sqlConfig.DB,
  sqlConfig.USER,
  sqlConfig.PASSWORD,
  {
    host: sqlConfig.HOST,
    port: sqlConfig.PORT,
    dialect: sqlConfig.dialect,
    logging: console.log,
    pool: {
      max: sqlConfig.pool.max,
      min: sqlConfig.pool.min,
      acquire: sqlConfig.pool.acquire,
      idle: sqlConfig.pool.idle
    }
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, logging: true });

    console.log("Connection has been established successfully To ***MYSQL.");
    log.info("Connection has been established successfully.");
  } catch (error) {
    log.fatal(error);
    console.error("Unable to connect to the MYSQL database", error);
  }
})();

module.exports = {
  sequelize: sequelize
};
