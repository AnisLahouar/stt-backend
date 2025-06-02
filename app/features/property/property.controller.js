const { RES_MESSAGES } = require("../../core/variables.constants");
const { Property, User, sequelize, PropertyImage } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");

const ResHandler = require("../../helpers/responseHandler.helper");
const { createImageData, UploadFile, deleteImageFile } = require("../propertyImage/propertyImage.service");
const { paginate } = require("../../helpers/paginate.helper");
const { sanitizeSearchInput } = require("../../helpers/search.helper");
const { includes } = require("lodash");
const { Op } = require("sequelize");


exports.create = async (req, res) => {
  const resHandler = new ResHandler();
  const transaction1 = await sequelize.transaction()
  let tempProperty;
  try {
    let { title, description, category, governorate, address, pricePerDay, pricePerMonth } = req.body;

    if (!isPropertyDataValid({ title, description, category, governorate, address, pricePerDay, pricePerMonth })) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
      return resHandler.send(res)
    }

    tempProperty = await Property.create({ ownerId: req.user.id, title, description, category, governorate, address, pricePerDay, pricePerMonth })

    const filesUrl = []
    const files = req.files.filter((file) => file.fieldname === "images")
    const filesPromises = files.map(async element => {
      const index = files.indexOf(element)
      const resultPath = await UploadFile(element, 'property', `${tempProperty.id}_${index}`)
      filesUrl.push(resultPath)
    })
    await Promise.all(filesPromises)

    const imagesData = [];
    const dataPromises = filesUrl.map(async element => {
      const { status, result } = await createImageData(tempProperty, element, transaction1)
      if (status)
        imagesData.push(result)
    })
    await Promise.all(dataPromises)

    await transaction1.commit()

    await User.update(
      {
        propertyCount: req.user.propertyCount + 1
      },
      {
        where: {
          id: req.user.id
        }
      });

    const result = { ...tempProperty, imagesData };

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
      result
    );
    return resHandler.send(res)
  } catch (error) {
    console.log("ERROR OCCURED: " + error)
    await transaction1.rollback()
    await tempProperty.destroy()
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    )
    return resHandler.send(res)
  }
}

exports.findAll = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    const pagination = paginate(
      req.query.page > 1 ? req.query.page : 1,
      req.query.pageSize || 10,
      req.query.orderBy,
      req.query.direction
    );

    const whereClause = req.query
      ? {
        //...(req.query.ownerId && { ownerId: { [Op.like]: `%${req.query.ownerId}%` } }),
        ...(req.query.title && { title: { [Op.like]: `%${req.query.title}%` } }),
        ...(req.query.category && { category: { [Op.like]: `%${req.query.category}%` } }),
        ...(req.query.bedrooms && { bedrooms: { [Op.like]: `%${req.query.bedrooms}%` } }),
        ...(req.query.bathrooms && { bathrooms: { [Op.like]: `%${req.query.bathrooms}%` } }),
        ...(req.query.governorate && { governorate: { [Op.like]: `%${req.query.governorate}%` } }),
        ...(req.query.address && { address: { [Op.like]: `%${req.query.address}%` } }),
        //...(req.query.pricePerDay && { pricePerDay: { [Op.like]: `%${req.query.pricePerDay}%` } }),
        //...(req.query.pricePerMonth && { pricePerMonth: { [Op.like]: `%${req.query.pricePerMonth}%` } }),
        ...(req.query.adminPricePerDay && { adminPricePerDay: { [Op.like]: `%${req.query.adminPricePerDay}%` } }),
        ...(req.query.adminPricePerMonth && { adminPricePerMonth: { [Op.like]: `%${req.query.adminPricePerMonth}%` } }),
        //...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
      }
      : {};

    // include images
    // exclude: price per day&month
    // status == accepted
    const properties = await Property.findAndCountAll({ ...pagination, where: whereClause });
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
      properties
    );
    return resHandler.send(res)
  } catch (error) {
    console.log("ERROR OCCURRED: " + error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

exports.findByOwner = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    const pagination = paginate(
      req.query.page > 1 ? req.query.page : 1,
      req.query.pageSize || 10,
      req.query.orderBy,
      req.query.direction
    );

    const whereClause = req.query
      ? {
        // ...(req.query.ownerId && { ownerId: { [Op.like]: `%${req.query.ownerId}%` } }),
        ...(req.query.title && { title: { [Op.like]: `%${req.query.title}%` } }),
        ...(req.query.category && { category: { [Op.like]: `%${req.query.category}%` } }),
        ...(req.query.bedrooms && { bedrooms: { [Op.like]: `%${req.query.bedrooms}%` } }),
        ...(req.query.bathrooms && { bathrooms: { [Op.like]: `%${req.query.bathrooms}%` } }),
        ...(req.query.governorate && { governorate: { [Op.like]: `%${req.query.governorate}%` } }),
        ...(req.query.address && { address: { [Op.like]: `%${req.query.address}%` } }),
        ...(req.query.pricePerDay && { pricePerDay: { [Op.like]: `%${req.query.pricePerDay}%` } }),
        ...(req.query.pricePerMonth && { pricePerMonth: { [Op.like]: `%${req.query.pricePerMonth}%` } }),
        ...(req.query.adminPricePerDay && { adminPricePerDay: { [Op.like]: `%${req.query.adminPricePerDay}%` } }),
        ...(req.query.adminPricePerMonth && { adminPricePerMonth: { [Op.like]: `%${req.query.adminPricePerMonth}%` } }),
        ...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
      }
      : {};

    const properties = await Property.findAndCountAll({
      where: {
        ownerId: req.params.id
      },
      ...pagination,
      where: whereClause
    });
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.FOUND_ALL,
      properties
    );
    return resHandler.send(res)
  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

//todo:
// create new variant
//add property image
//add: reservations
//include: admin prices only
// if property not accepted +> throw error
exports.findOne = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    //todo: add check if admin => continue
    // else ownerId == req.user.id ? continue : throw error

    const property = await Property.findByPk(req.params.id,
      {
        include: [
          {
            model: PropertyImage,
          },
          {
            model: User,
            as: 'owner',
            attributes: { exclude: ['password'] }
          }
        ]
      });

    if (property) {
      // property.user.password = '';
      resHandler.setSuccess(
        HttpStatus.OK,
        RES_MESSAGES.PROPERTY.SUCCESS.FOUND,
        property
      );
      return resHandler.send(res)
    }

    resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
    return resHandler.send(res)
  }
  catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

exports.update = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    let { title, description, category, bedrooms, bathrooms, governorate, address, pricePerDay, pricePerMonth } = req.body;

    // if (!isPropertyDataValid({ ownerId, title, description, address, pricePerDay, pricePerMonth })) {
    // 	resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
    // 	return resHandler.send(res)
    // }

    const updateData = {
      title: title ? title : property.title,
      description: description ? description : property.description,
      category: category ? category : property.category,
      governorate: governorate ? governorate : property.governorate,
      address: address ? address : property.address,
      pricePerDay: pricePerDay ? pricePerDay : property.pricePerDay,
      pricePerMonth: pricePerMonth ? pricePerMonth : property.pricePerMonth,
      bedrooms: bedrooms ? bedrooms : property.bedrooms,
      bathrooms: bathrooms ? bathrooms : property.bathrooms,
    }
    const updatedData = await property.update(updateData);
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
      updatedData
    );
    return resHandler.send(res)
  }
  catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

exports.confirm = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    let { adminPricePerDay, adminPricePerMonth, status } = req.body;

    // if (!isPropertyDataAdminValid({ adminPricePerDay, adminPricePerMonth, status })) {
    //   resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
    //   return resHandler.send(res)
    // }

    //add missing fields to allow admin to update all fields 
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    property.adminPricePerDay = adminPricePerDay ? adminPricePerDay : property.adminPricePerDay;
    property.adminPricePerMonth = adminPricePerMonth ? adminPricePerMonth : property.adminPricePerMonth;
    property.status = status ? status : property.status;

    await property.save();
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.UPDATED,
      property
    );
    return resHandler.send(res)
  }
  catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

exports.delete = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    const { ownerId } = req.body;
    if (!ownerId) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
      return resHandler.send(res)
    }

    const user = await User.findByPk(ownerId);

    if (!user) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.USER_NOT_FOUND);
      return resHandler.send(res)
    }

    await property.destroy();

    user.propertyCount--;

    await user.update({ propertyCount: user.propertyCount });

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.DELETED,
      {}
    );
    return resHandler.send(res)
  }
  catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
};

exports.deleteImage = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    if (!req.params.id || !req.params.imageId) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.INVALID_PARAMETERS);
      return resHandler.send(res)
    }

    const property = await Property.findAll({
      where: {
        id: req.params.id,
        ownerId: req.id
      }
    })

    if (!property) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    const image = await PropertyImage.findByPk({
      where: {
        id: req.params.imageId
      }
    })

    await image.destroy();
    await deleteImageFile(image.imageUrl)

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.DELETED,
      {}
    );
    return resHandler.send(res)

  }
  catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    );
    return resHandler.send(res)
  }
}


function isPropertyDataValid(inProperty) {
  if (!inProperty.title || !inProperty.description || !inProperty.category ||
    !inProperty.governorate || !inProperty.address || !inProperty.description ||
    !inProperty.pricePerDay || !inProperty.pricePerMonth)
    return false
  return true
}

function isPropertyDataAdminValid(inProperty) {
  if (!inProperty.adminPricePerDay || !inProperty.adminPricePerMonth || !inProperty.status)
    return false
  return true
}