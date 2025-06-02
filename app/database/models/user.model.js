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
      type: DataTypes.STRING,
      defaultValue: ""
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
      type: DataTypes.STRING,
      defaultValue: ""
    },
    role: {
      type: DataTypes.ENUM("admin", "owner", "client"),//add superAdmin
      defaultValue: "client"
    },
    propertyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    },
    deletedAt: {
      type: Sequelize.DATE,
    }
    // created By: Opional field
    // superAdmin => creates admin
  },
  {
    indexes: [{ unique: true, fields: ["email"] }],
    paranoid: true
  }
);
