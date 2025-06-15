const { isAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const { getGeneralAnalytics } = require("./analytics.controller");

const router = require("express").Router();

router.get('/', [userMiddleware, isAdminMiddleware], getGeneralAnalytics)

module.exports = router;
