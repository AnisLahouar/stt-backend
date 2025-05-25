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
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  governorate: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  pricePerDay: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  pricePerMonth: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  adminPricePerDay: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  adminPricePerMonth: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "hidden"),
    defaultValue: "pending"
  },
  deletedAt: {
    type: Sequelize.DATE,
  }
}, {
  paranoid: true
});
