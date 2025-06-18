const { isAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const { getGeneralAnalytics, generate } = require("./analytics.controller");

const router = require("express").Router();

router.get('/', [userMiddleware, isAdminMiddleware], getGeneralAnalytics)
router.post('/', [userMiddleware, isAdminMiddleware], generate)

module.exports = router;
