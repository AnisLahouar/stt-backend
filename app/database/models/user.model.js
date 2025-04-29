const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

exports.User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM("admin", "owner", "client")
    },
    propertyCount: {
      type: DataTypes.INTEGER,
    },
    staus: {
      type: DataTypes.ENUM("active", "inactive")
    }
  },
  {
    indexes: [{ unique: true, fields: ["email"] }]
  }
);
