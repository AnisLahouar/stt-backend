const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

exports.Property = sequelize.define("Property", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  address: {
    type: DataTypes.STRING
  },
  pricePerDay: {
    type: DataTypes.DECIMAL
  },
  pricePerMonth: {
    type: DataTypes.DECIMAL
  },
  adminPricePerDay: {
    type: DataTypes.DECIMAL
  },
  adminPricePerMonth: {
    type: DataTypes.DECIMAL
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "hidden"),
    defaultValue: "pending"
  }
});
