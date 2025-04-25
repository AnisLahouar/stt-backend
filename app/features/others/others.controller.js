const { Op } = require("sequelize");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { User, Others } = require("../../database");
const ResHandler = require("../../helpers/responseHandler.helper");
const { paginate } = require("../../helpers/paginate.helper");

exports.getAll = async (req, res) => {
  // #swagger.tags = ['Others']
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

    const othersData = await Others.findAndCountAll({
      where: {
        userId: req.id,
        ...(folder_name && folder_name != "All" && { folder_name }),
        ...(label && { label: { [Op.like]: `%${label}%` } }),
        deletedAt: { [Op.is]: null }
      },
      attributes: { exclude: ["deletedAt", "updatedAt"] },
      ...pagination
    });
    resHandler.setSuccess(
      HttpStatus.OK,
      "Elements fetched Successfully ",
      othersData
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
  // #swagger.tags = ['Others']

  const resHandler = new ResHandler(res);
  try {
    const { label, fields, folder_name } = req.body;
    const newInseredData = await Others.create({
      label,
      fields,
      folder_name,
      userId: req.id
    });
    resHandler.setSuccess(
      HttpStatus.OK,
      "Element created successfully",
      newInseredData
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
  // #swagger.tags = ['Others']
  const resHandler = new ResHandler(res);
  try {
    const { label, fields, folder_name } = req.body;
    const otherId = req.params.id;
    const otherData = await Others.findByPk(otherId);
    if (!otherData) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Element not found");
      return resHandler.send(res);
    }
    if (otherData.userId !== req.id) {
      resHandler.setError(
        HttpStatus.FORBIDDEN,
        "You are not allowed to update this Element"
      );
      return resHandler.send(res);
    }
    otherData.label = label;
    otherData.fields = fields;
    otherData.folder_name = folder_name;
    await otherData.save();
    resHandler.setSuccess(HttpStatus.OK, "Element updated successfully");
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
    const otherId = req.params.id;
    const otherData = await Others.findByPk(otherId);
    if (!otherData) {
      resHandler.setError(HttpStatus.BAD_GATEWAY, "Element not found");
      return resHandler.send(res);
    }
    if (otherData.userId !== req.id) {
      resHandler.setError(
        HttpStatus.FORBIDDEN,
        "You are not allowed to delete this Element"
      );
      return resHandler.send(res);
    }
    otherData.deletedAt = new Date();
    await otherData.save();
    resHandler.setSuccess(HttpStatus.OK, "Element deleted successfully");
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
