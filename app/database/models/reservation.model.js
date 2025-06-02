const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

//reservation, replace dates with json object
exports.Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  clientName: {
    type: DataTypes.STRING
  },
  clientEmail: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  clientPhone: {
    type: DataTypes.STRING
  },
  comment: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "declined"),
    defaultValue: "pending"
  }
});
