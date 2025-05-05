const { User } = require("../../database");
const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");

const ResHandler = require("../../helpers/responseHandler.helper");

exports.create = async (req, res) => {
    const resHandler = new ResHandler();
    try {
        const user = await User.create(req.body)
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
        const users = await User.findAll();
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
