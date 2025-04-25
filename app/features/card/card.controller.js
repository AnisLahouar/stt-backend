const { Op } = require("sequelize");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { User, Service, Card } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");


exports.getAll = async (req, res) => {
  // #swagger.tags = ['Card']
  const resHandler = new ResHandler(res);
  try {
    const cards = await Card.findAll({ where: { userId: req.id, deletedAt: { [Op.is]: null } } });
    resHandler.setSuccess(HttpStatus.OK, "Cards fetched Successfully ", cards);
    return resHandler.send(res);
  }
  catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
};

exports.create = async (req, res) => {
  // #swagger.tags = ['Card']

  const resHandler = new ResHandler(res);
  try {
    const {
      card_name,
      card_type,
      card_number,
      card_holder,
      holder_email,
      card_expiry,
      card_cvv,
      card_pin,
      internet_secret } = req.body;
    const NewCard = await Card.create({
      card_name,
      card_type,
      card_number,
      card_holder,
      holder_email,
      card_expiry,
      card_cvv,
      card_pin,
      internet_secret,
      userId: req.id
    });

    resHandler.setSuccess(HttpStatus.OK, "Service created successfully", NewCard);
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}

exports.update = async (req, res) => {
  // #swagger.tags = ['Card']
  const resHandler = new ResHandler(res);
  try {
    const {
      card_name,
      card_type,
      card_number,
      card_holder,
      holder_email,
      card_expiry,
      card_cvv,
      card_pin,
      internet_secret } = req.body;
    const cardId = req.params.id;
    const updatedCard = await Card.findByPk(cardId);
    if (!updatedCard) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Card not found");
      return resHandler.send(res);
    }
    updatedCard.card_name = card_name,
      updatedCard.card_type = card_type,
      updatedCard.card_number = card_number,
      updatedCard.card_holder = card_holder,
      updatedCard.holder_email = holder_email,
      updatedCard.card_expiry = card_expiry,
      updatedCard.card_cvv = card_cvv,
      updatedCard.card_pin = card_pin
    updatedCard.internet_secret = internet_secret,
      await updatedCard.save();
    resHandler.setSuccess(HttpStatus.OK, "Card updated successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}

exports.delete = async (req, res) => {
  // #swagger.tags = ['Card']
  const resHandler = new ResHandler(res);
  try {
    const cardId = req.params.id;
    const card = await Card.findByPk(cardId);
    if (!card) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Card not found");
      return resHandler.send(res);
    }
    card.deletedAt = new Date();
    await card.save();
    resHandler.setSuccess(HttpStatus.OK, "Card deleted successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}