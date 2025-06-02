const router = require("express").Router();

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { isAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const user = require("./user.controller");

router.post("/", user.create);
router.get("/", user.findAll);
router.get("/:id", [userMiddleware, isAdminMiddleware], user.findOne);
router.put("/:id", [userMiddleware, isAdminMiddleware], user.adminUpdate);
router.put("/", [userMiddleware], user.update);
router.get("/as-admin/:role", [userMiddleware], user.adminGet)

module.exports = router;
