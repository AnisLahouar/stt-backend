const { RES_MESSAGES } = require("../../core/variables.constants");
const { Property, User, sequelize, PropertyImage, Reservation, ReservationDate } = require('../../database')
const { HttpStatus } = require("../../core/http_status.constants");

const ResHandler = require("../../helpers/responseHandler.helper");
const { createImageData, UploadFile, deleteImageFile } = require("../propertyImage/propertyImage.service");
const { paginate } = require("../../helpers/paginate.helper");
const { sanitizeSearchInput } = require("../../helpers/search.helper");
const { includes } = require("lodash");
const { Op, where } = require("sequelize");
const { hasAdminPriviledges } = require("../../helpers/user.helper");
const { addPendingPropertyCreation, acceptPendingPropertyCreation } = require("../analytics/analytics.service");
const { v4: uuidv4 } = require("uuid");


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

    const imagesData = [];
    const files = req.files.filter((file) => file.fieldname === "images")
    const filesPromises = files.map(async element => {
      const index = files.indexOf(element)
      const resultPath = await UploadFile(element, 'property', `${tempProperty.id}_${uuidv4()}`)
      if (resultPath) {
        const { status, result } = await createImageData(tempProperty, resultPath, index, transaction1)
        if (status)
          imagesData.push(result)
      }
    })
    await Promise.all(filesPromises)

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

    await addPendingPropertyCreation();

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

exports.count = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const ownerId = req.params.ownerId;
    if (!ownerId) {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        RES_MESSAGES.MISSING_PARAMETERS
      );
      return resHandler.send(res);
    }

    const counts = await Property.findAll({
      where: { ownerId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Format output as { pending: X, accepted: Y, hidden: Z }
    const result = {
      pending: 0,
      accepted: 0,
      hidden: 0
    };

    counts.forEach(row => {
      result[row.status] = parseInt(row.getDataValue('count'), 10);
    });

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.COUNTED,
      result
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

exports.publicFindAll = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    const pagination = paginate(
      req.query.page > 1 ? req.query.page : 1,
      req.query.pageSize || 10,
      req.query.orderBy,
      req.query.direction
    );

    const whereClause = {
      status: 'accepted',
      ...(req.query.title && { title: { [Op.like]: `%${req.query.title}%` } }),
      ...(req.query.category && { category: { [Op.like]: `%${req.query.category}%` } }),
      ...(req.query.bedrooms && { bedrooms: { [Op.like]: `%${req.query.bedrooms}%` } }),
      ...(req.query.bathrooms && { bathrooms: { [Op.like]: `%${req.query.bathrooms}%` } }),
      ...(req.query.governorate && { governorate: { [Op.like]: `%${req.query.governorate}%` } }),
      ...(req.query.address && { address: { [Op.like]: `%${req.query.address}%` } }),
      ...(req.query.adminPricePerDay && { adminPricePerDay: { [Op.like]: `%${req.query.adminPricePerDay}%` } }),
      ...(req.query.adminPricePerMonth && { adminPricePerMonth: { [Op.like]: `%${req.query.adminPricePerMonth}%` } }),
    }

    // include images
    // exclude: price per day&month
    // status == accepted
    const properties = await Property.findAndCountAll(
      { ...pagination, where: whereClause, include: [{ model: PropertyImage }], attributes: { exclude: ['pricePerDay', 'pricePerMonth'] } },
    );
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

exports.findAll = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    const pagination = paginate(
      req.query.page > 1 ? req.query.page : 1,
      req.query.pageSize || 10,
      req.query.orderBy,
      req.query.direction
    );

    const whereClause = {
      status: 'accepted',
      ...(req.query.title && { title: { [Op.like]: `%${req.query.title}%` } }),
      ...(req.query.category && { category: { [Op.like]: `%${req.query.category}%` } }),
      ...(req.query.bedrooms && { bedrooms: { [Op.like]: `%${req.query.bedrooms}%` } }),
      ...(req.query.bathrooms && { bathrooms: { [Op.like]: `%${req.query.bathrooms}%` } }),
      ...(req.query.governorate && { governorate: { [Op.like]: `%${req.query.governorate}%` } }),
      ...(req.query.address && { address: { [Op.like]: `%${req.query.address}%` } }),
      ...(req.query.adminPricePerDay && { adminPricePerDay: { [Op.like]: `%${req.query.adminPricePerDay}%` } }),
      ...(req.query.adminPricePerMonth && { adminPricePerMonth: { [Op.like]: `%${req.query.adminPricePerMonth}%` } }),
    }

    // include images
    // exclude: price per day&month
    // status == accepted
    const properties = await Property.findAndCountAll(
      {
        ...pagination, where: whereClause,
        include: [{ model: PropertyImage }],
        attributes: {
          exclude: hasAdminPriviledges(req.user) ? [] : ['pricePerDay', 'pricePerMonth']
        }
      },
    );
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
exports.publicGetOne = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const property = await Property.findByPk(req.params.id,
      {
        attributes: {
          exclude: ['pricePerDay', 'pricePerMonth']
        }
      },
      {
        include: [
          {
            model: PropertyImage,
          },
          // {
          //   model: User,
          //   as: 'owner',
          //   attributes: { exclude: ['password', 'createdBy'] }
          // },
          {
            model: Reservation,
            include: {
              model: ReservationDate
            }
          }
        ]
      });

    if (!property || property.status != 'accepted') {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        !property ? RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND : RES_MESSAGES.PROPERTY.ERROR.UNVERIFIED
      );
      return resHandler.send(res)
    }

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.FOUND,
      property
    );
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
}

exports.findOne = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    //todo: add check if admin => continue
    // else ownerId == req.user.id ? continue : throw error
    console.log(req.user);
    const isAdminLevel = hasAdminPriviledges(req.user);
    if (!isAdminLevel) {
      if (req.user.id != req.params.id) {
        resHandler.setError(
          HttpStatus.BAD_REQUEST,
          RES_MESSAGES.INVALID_PARAMETERS,
        );
        return resHandler.send(res)
      }
    }

    const property = await Property.findByPk(req.params.id,
      {
        include: [
          {
            model: PropertyImage,
          },
          {
            model: User,
            as: 'owner',
            attributes: { exclude: ['password', 'createdBy'] }
          }
        ]
      });

    if (property) {
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
      status: 'pending'
    }

    const wasAccepted = property.status == 'accepted'

    const updatedData = await property.update(updateData);

    if (wasAccepted) {
      await addPendingPropertyCreation();
    }

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
    let { adminPricePerDay, adminPricePerMonth, status,
      title, description, category, bedrooms, bathrooms, governorate, address, pricePerDay, pricePerMonth
    } = req.body;

    // if (!isPropertyDataAdminValid({ adminPricePerDay, adminPricePerMonth, status })) {
    //   resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
    //   return resHandler.send(res)
    // }

    const updateData = {
      adminPricePerDay: adminPricePerDay ? adminPricePerDay : property.adminPricePerDay,
      adminPricePerMonth: adminPricePerMonth ? adminPricePerMonth : property.adminPricePerMonth,
      status: status ? status : property.status,

      title: title ? title : property.title,
      description: description ? description : property.description,
      category: category ? category : property.category,
      governorate: governorate ? governorate : property.governorate,
      address: address ? address : property.address,
      pricePerDay: pricePerDay ? pricePerDay : property.pricePerDay,
      pricePerMonth: pricePerMonth ? pricePerMonth : property.pricePerMonth,
      bedrooms: bedrooms ? bedrooms : property.bedrooms,
      bathrooms: bathrooms ? bathrooms : property.bathrooms,
      bathrooms: bathrooms ? bathrooms : property.bathrooms,
      bathrooms: bathrooms ? bathrooms : property.bathrooms,
    }

    //add missing fields to allow admin to update all fields 
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    await property.update(updateData);

    await acceptPendingPropertyCreation();

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


    const wasAccepted = property.status == 'accepted'

    await property.destroy();

    user.propertyCount--;

    await user.update({ propertyCount: user.propertyCount });

    if (!wasAccepted) {
      await acceptPendingPropertyCreation();
    }

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

exports.updateDefaultImage = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const { propertyId, oldDefaultId, newDefaultId } = req.body;
    if (!propertyId || !oldDefaultId || !newDefaultId) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.MISSING_PARAMETERS);
      return resHandler.send(res)
    }

    const property = await Property.findByPk(req.params.id);

    if (!property) {
      resHandler.setError(HttpStatus.NOT_FOUND, RES_MESSAGES.PROPERTY.ERROR.NOT_FOUND);
      return resHandler.send(res)
    }

    if (property.ownerId != req.user.id) {
      if (!hasAdminPriviledges(req.user)) {
        resHandler.setError(HttpStatus.UNAUTHORIZED, RES_MESSAGES.USER.ERROR.UNAUTHORIZED);
        return resHandler.send(res)
      }
    }

    await PropertyImage.update(
      { isDefault: true },
      {
        where: {
          id: newDefaultId
        }
      });

    await PropertyImage.update(
      { isDefault: false },
      {
        where: {
          id: oldDefaultId
        }
      });

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY_IMAGE.SUCCESS.UPDATED,
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

exports.deleteImage = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    if (!req.params.id || !req.params.imageId) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.INVALID_PARAMETERS);
      return resHandler.send(res)
    }

    const property = await Property.findOne({
      where: {
        id: req.params.id,
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

exports.addImage = async (req, res) => {
  const resHandler = new ResHandler();
  const transaction1 = await sequelize.transaction()
  try {

    const { propertyId } = req.body;

    if (!propertyId) {
      throw new Error("");
    }

    const property = await Property.findByPk(propertyId)

    const imagesData = [];
    const files = req.files.filter((file) => file.fieldname === "images")
    const filesPromises = files.map(async element => {
      const index = files.indexOf(element)
      const resultPath = await UploadFile(element, 'property', `${property.id}_${uuidv4()}`)
      if (resultPath) {
        const { status, result } = await createImageData(property, resultPath, index, transaction1)
        if (status)
          imagesData.push(result)
      }
    })
    await Promise.all(filesPromises)

    await transaction1.commit()

    await property.update({ status: 'pending' })

    await addPendingPropertyCreation();

    const result = { ...property, imagesData };

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.PROPERTY.SUCCESS.CREATED,
      result
    );
    return resHandler.send(res)
  } catch (error) {
    console.log("ERROR OCCURED: " + error)
    await transaction1.rollback()
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    )
    return resHandler.send(res)
  }
}
