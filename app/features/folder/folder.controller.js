const { Op } = require("sequelize");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { User, Service, Folder } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");


exports.getAll = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const folders = await Folder.findAll({
      where: {
        deletedAt: {
          [Op.eq]: null
        }
    }});
    resHandler.setSuccess(HttpStatus.OK, "Folders fetched Successfully ", folders);
    return resHandler.send(res);
  }
  catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
};

exports.create = async (req, res) => {
  // #swagger.tags = ['Services']

  const resHandler = new ResHandler(res);
  try {
    const { label, service, identifier, password } = req.body;
    const NewService = await Service.create({ label, service, identifier, password, userId: req.id });
    resHandler.setSuccess(HttpStatus.OK, "Service created successfully", NewService);
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}

exports.update = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const { label, service, identifier, password } = req.body;
    const serviceId = req.params.id;
    const updatedService = await Service.findByPk(serviceId);
    if (!updatedService) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Service not found");
      return resHandler.send(res);
    }
    if (updatedService.userId !== req.id) {
      resHandler.setError(HttpStatus.FORBIDDEN, "You are not allowed to update this service");
      return resHandler.send(res);
    }
    updatedService.label = label;
    updatedService.service = service;
    updatedService.identifier = identifier;
    updatedService.password = password;
    await updatedService.save();
    resHandler.setSuccess(HttpStatus.OK, "Service updated successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}

exports.delete = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const serviceId = req.params.id;
    const service = await Service.findByPk(serviceId);
    if (!service) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Service not found");
      return resHandler.send(res);
    }
    service.deletedAt = new Date();
    await service.save();
    resHandler.setSuccess(HttpStatus.OK, "Service deleted successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(HttpStatus.INTERNAL_SERVER_ERROR, RES_MESSAGES.SERVER_ERROR);
    return resHandler.send(res);
  }
}