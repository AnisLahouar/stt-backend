const { sequelize } = require("../sequelize");
const { DataTypes, Sequelize } = require("sequelize");

exports.PropertyImage = sequelize.define("PropertyImage", {
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
  imageUrl: {
    type: DataTypes.STRING
  }
});


// crud: use transaction to ensure data is created, then file uploaded, data is created => apply transactionx
// fetch property id before transaction is DONE