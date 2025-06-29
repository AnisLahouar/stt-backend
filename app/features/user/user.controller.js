const { User } = require("../../database");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES, PASSWORD_MIN_LENGTH } = require("../../core/variables.constants");

const ResHandler = require("../../helpers/responseHandler.helper");
const { paginate } = require("../../helpers/paginate.helper");
const { Op, where } = require("sequelize");
const { hasAdminPriviledges } = require("../../helpers/user.helper");

exports.createBySuper = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    // if (req.user.role != 'superAdmin') {
    //   resHandler.setError(
    //     HttpStatus.UNAUTHORIZED,
    //     RES_MESSAGES.USER.ERROR.UNAUTHORIZED,
    //   );
    //   return resHandler.send(res)
    // }

    const { email, name, password, phone, address, role, status } = req.body
    if (!isUserDataValid({ email, name, password, phone, address, status }) || !role) {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        RES_MESSAGES.MISSING_PARAMETERS,
      );
      return resHandler.send(res)
    }

    // role = "admin"
    const user = await User.create({ email, name, password, phone, address, role, status, createdBy: req.user.id });
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.CREATED,
      user
    );
    return resHandler.send(res)

  } catch (error) {
    console.log(`Error Occured: ${error.message}`);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}`
    )
    return resHandler.send(res)
  }
}

exports.create = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const { email, name, password, phone, address, role, status } = req.body

    if (!hasAdminPriviledges(req.user)) {
      if (role == 'admin' || role == 'superAdmin') {
        resHandler.setError(
          HttpStatus.BAD_REQUEST,
          RES_MESSAGES.INVALID_PARAMETERS,
        );
        return resHandler.send(res)
      }
    }

    if (!isUserDataValid({ email, name, password, phone, address, role, status })) {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        RES_MESSAGES.MISSING_PARAMETERS,
      );
      return resHandler.send(res)
    }

    const user = await User.create({ email, name, password, phone, address, role, status, createdBy: req.user.id });
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.CREATED,
      user
    );
    return resHandler.send(res)
  } catch (error) {
    console.log(`Error Occured: ${error.message}`);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
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
        ...(req.query.email && { email: { [Op.like]: `%${req.query.email}%` } }),
        ...(req.query.name && { name: { [Op.like]: `%${req.query.name}%` } }),
        ...(req.query.phone && { phone: { [Op.like]: `%${req.query.phone}%` } }),
        ...(req.query.address && { address: { [Op.like]: `%${req.query.address}%` } }),
        ...(req.query.role && { role: { [Op.like]: `%${req.query.role}%` } }),
        ...(req.query.status && { status: { [Op.like]: `%${req.query.status}%` } }),
      }
      : {};

    const users = await User.findAndCountAll({ ...pagination, where: whereClause });
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.FOUND_ALL,
      users
    );
    return resHandler.send(res)
  } catch (error) {
    console.log(`Error Occured: ${error.message}`);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}`
    )
    return resHandler.send(res)
  }
}

exports.findOne = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    if (!req.params.id) {
      resHandler.setError(
        HttpStatus.NOT_FOUND,
        RES_MESSAGES.INVALID_PARAMETERS
      )
      return resHandler.send(res)
    }

    const user = await User.findByPk(req.params.id)
    if (!user) {
      resHandler.setError(
        HttpStatus.NOT_FOUND,
        RES_MESSAGES.USER.ERROR.NOT_FOUND
      )
      return resHandler.send(res)
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      user.password = '';
    }

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.FOUND,
      user
    )
    return resHandler.send(res)
  } catch (error) {
    console.log(`Error Occured: ${error.message}`);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}`
    )
    return resHandler.send(res)
  }
}

exports.adminUpdate = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const { email, name, password, phone, address, status } = req.body

    // if (!isUserDataValid({ email, name, password, phone, address, role, status })) {
    // 	resHandler.setError(
    // 		HttpStatus.BAD_REQUEST,
    // 		RES_MESSAGES.MISSING_PARAMETERS,
    // 	);
    // 	return resHandler.send(res)
    // }

    const user = await User.findByPk(req.params.id)
    if (!user) {
      resHandler.setError(
        HttpStatus.NOT_FOUND,
        RES_MESSAGES.USER.ERROR.NOT_FOUND
      )
      return resHandler(res)
    }

    const updateData = {
      email: email ? email : user.email,
      name: name ? name : user.name,
      password: password ? password : user.password,
      phone: phone ? phone : user.phone,
      address: address ? address : user.address,
      status: status ? status : user.status
    }

    let updatedUser = await user.update(updateData);
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.CREATED,
      updatedUser
    );
    return resHandler.send(res)

  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    )
    return resHandler.send(res)
  }
}


exports.update = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const { email, name, phone, address, status } = req.body

    // if (!isUserDataValid({ email, name, password, phone, address, role, status })) {
    // 	resHandler.setError(
    // 		HttpStatus.BAD_REQUEST,
    // 		RES_MESSAGES.MISSING_PARAMETERS,
    // 	);
    // 	return resHandler.send(res)
    // }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      resHandler.setError(
        HttpStatus.NOT_FOUND,
        RES_MESSAGES.USER.ERROR.NOT_FOUND
      )
      return resHandler(res)
    }

    const updateData = {
      email: email ? email : user.email,
      name: name ? name : user.name,
      phone: phone ? phone : user.phone,
      address: address ? address : user.address,
      status: status ? status : user.status
    }

    let updatedUser = await user.update(updateData);
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.CREATED,
      updatedUser
    );
    return resHandler.send(res)

  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    )
    return resHandler.send(res)
  }
}

exports.updatePassword = async (req, res) => {
  const resHandler = new ResHandler();
  try {
    const { password } = req.body
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        `${RES_MESSAGES.INVALID_PARAMETERS}`
      )
      return resHandler.send(res)
    }

    const user = await User.findByPk(req.user.id)

    await user.update({ password: password })

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.UPDATED,
      {}
    );

  } catch (error) {
    console.log(error.message);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}`
    )
    return resHandler.send(res)
  }
}

exports.adminGet = async (req, res) => {
  const resHandler = new ResHandler();
  try {

    if (!req.params.role || req.params.role == 'admin' || req.params.role == 'superAdmin') {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        RES_MESSAGES.INVALID_PARAMETERS,
      );
      return resHandler.send(res)
    }

    let users = []
    if (req.user.role == 'admin') {
      users = await User.findAll({
        where: { role: req.params.role },
        attributes: ['id', 'name', 'email', 'propertyCount', 'status']
      });
    }

    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.FOUND_ALL,
      users
    );
    return resHandler.send(res)
  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
    )
    return resHandler.send(res)
  }
}


function isUserDataValid(inData) {
  if (!inData.email || !inData.name || !inData.password || !inData.phone || !inData.address || !inData.status) {
    return false
  }
  return true
}