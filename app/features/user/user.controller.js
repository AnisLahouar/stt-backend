const { User } = require("../../database");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");

const ResHandler = require("../../helpers/responseHandler.helper");

exports.create = async (req, res) => {
	const resHandler = new ResHandler();
	try {
		const { email, name, password, phone, address, role, status } = req.body
		if (role == 'admin') {
			resHandler.setError(
				HttpStatus.BAD_REQUEST,
				RES_MESSAGES.INVALID_PARAMETERS,
			);
			return resHandler.send(res)
		}
		if (!email || !name || !password || !phone || !address || !role || !status) {
			resHandler.setError(
				HttpStatus.BAD_REQUEST,
				RES_MESSAGES.MISSING_PARAMETERS,
			);
			return resHandler.send(res)
		}
		const user =
			await User.create({ email, name, password, phone, address, role, status });
		resHandler.setSuccess(
			HttpStatus.OK,
			RES_MESSAGES.USER.SUCCESS.CREATED,
			user
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

exports.findAll = async (req, res) => {
	const resHandler = new ResHandler();
	try {

		const pagination = paginate(
			req.query.page || 0,
			req.query.pageSize || 10,
			req.query.orderBy,
			req.query.direction
		);

		const users = await User.findAll({...pagination});
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
