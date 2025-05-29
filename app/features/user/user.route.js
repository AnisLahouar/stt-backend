const router = require("express").Router();

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { isAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const user = require("./user.controller");

router.post("/", user.create);
router.get("/", user.findAll);
router.get("/:id", user.findOne);
router.put("/:id", user.update);
router.get("/as-admin/:role", [userMiddleware, isAdminMiddleware], user.adminGet)

module.exports = router;
