const { Op } = require("sequelize");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { User, Service } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");
const { paginate } = require("../../helpers/paginate.helper");

exports.getAll = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const pagination = paginate(
      req.query.page || 0,
      req.query.pageSize || 10,
      req.query.orderBy,
      req.query.direction
  );
    const folder_name = req.query.folder_name;
    const label = req.query.label;
    const services = await Service.findAndCountAll({
      where: {
        userId: req.id,
        ...(folder_name != "All" && { folder_name }),
        ...(label && { label: { [Op.like]: `%${label}%` } }),
        deletedAt: { [Op.is]: null }
      },
      attributes: { exclude: ["deletedAt",  "updatedAt"] },
      ...pagination
       });
    resHandler.setSuccess(
      HttpStatus.OK,
      "Services fetched Successfully ",
      services
    );
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

exports.getAllForExport = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const services = await Service.findAll({
      where: {
        userId: req.id
      },
      attributes: { exclude: ["deletedAt", "updatedAt"] }
    });
    resHandler.setSuccess(
      HttpStatus.OK,
      "Services fetched Successfully ",
      services
    );
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

exports.create = async (req, res) => {
  // #swagger.tags = ['Services']

  const resHandler = new ResHandler(res);
  try {
    const { label, service, folder_name, identifier, password } = req.body;
    const NewService = await Service.create({
      label,
      service,
      identifier,
      folder_name,
      password,
      userId: req.id
    });
    resHandler.setSuccess(
      HttpStatus.OK,
      "Service created successfully",
      NewService
    );
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

exports.update = async (req, res) => {
  // #swagger.tags = ['Services']
  const resHandler = new ResHandler(res);
  try {
    const { label, service, folder_name, identifier, password } = req.body;
    const serviceId = req.params.id;
    const updatedService = await Service.findByPk(serviceId);
    if (!updatedService) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Service not found");
      return resHandler.send(res);
    }
    if (updatedService.userId !== req.id) {
      resHandler.setError(
        HttpStatus.FORBIDDEN,
        "You are not allowed to update this service"
      );
      return resHandler.send(res);
    }
    updatedService.label = label;
    updatedService.service = service;
    updatedService.identifier = identifier;
    updatedService.folder_name = folder_name;
    updatedService.password = password;
    await updatedService.save();
    resHandler.setSuccess(HttpStatus.OK, "Service updated successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

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
    if (service.userId !== req.id) {
      resHandler.setError(
        HttpStatus.FORBIDDEN,
        "You are not allowed to delete this service"
      );
      return resHandler.send(res);
    }
    service.deletedAt = new Date();
    await service.save();
    resHandler.setSuccess(HttpStatus.OK, "Service deleted successfully");
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};
