const { User } = require("./models/user.model");
const { Property } = require("./models/property.model");
const { PropertyImage } = require("./models/propertyImage.model");
const { Reservation } = require("./models/reservation.model");
const { ReservationDate } = require("./models/reservationDate.model");
const { sequelize } = require("./sequelize");

// User-Property
User.hasMany(Property, {
  foreignKey: "ownerId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
Property.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

// Property-Image
Property.hasMany(PropertyImage, {
  foreignKey: "propertyId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
PropertyImage.belongsTo(Property, {
  foreignKey: "propertyId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

// Property-Reservation
Property.hasMany(Reservation, {
  foreignKey: "propertyId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
Reservation.belongsTo(Property, {
  foreignKey: "propertyId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

// Reservation-Dates
Reservation.hasMany(ReservationDate, {
  foreignKey: "reservationId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
ReservationDate.belongsTo(Reservation, {
  foreignKey: "reservationId",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

module.exports = {
  User,
  Property,
  PropertyImage,
  Reservation,
  ReservationDate,
  sequelize,
};
