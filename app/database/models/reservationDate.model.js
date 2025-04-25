const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

exports.ReservationDate = sequelize.define("ReservationDate", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY
  }
});
