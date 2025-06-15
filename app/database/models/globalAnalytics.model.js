const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

exports.GlobalAnalytics = sequelize.define("GlobalAnalytics", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  pendingProperties: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pendingReservations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});
