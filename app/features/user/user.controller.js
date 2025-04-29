const {User} = require("../../database");
const {HttpStatus} = require("../../core/http_status.constants");
const {RES_MESSAGES} = require("../../core/variables.constants");

const ResHandler = require("../../helpers/responseHandler.helper");

exports.create = async (req, res) => {
    const resHandler = new ResHandler(res);
    try {
        const user = await User.create(req.body)
        return resHandler.setSuccess(
            HttpStatus.OK,
            RES_MESSAGES.USER.SUCCESS.CREATED,
            user
        );
    } catch (error) {
        return resHandler.setError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
        )
    }
}

exports.findAll = async (req, res) => {
    const resHandler = new ResHandler(res);
    try {
        const users = await User.findAll();
        return resHandler.setSuccess(
            HttpStatus.OK,
            RES_MESSAGES.USER.SUCCESS.FOUND_ALL,
            users
        );
    } catch (error) {
        return resHandler.setError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `${RES_MESSAGES.SERVER_ERROR}: ${error.message}`
        )
    }
}
