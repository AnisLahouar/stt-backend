const router = require("express").Router();

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { isAdminMiddleware, isSuperAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const user = require("./user.controller");

router.post("/create-admin", [userMiddleware, isSuperAdminMiddleware],user.createBySuper);
router.post("/", [userMiddleware], user.create);
router.get("/", user.findAll);
router.get("/:id", [userMiddleware], user.findOne);
router.put("/:id", [userMiddleware, isAdminMiddleware], user.adminUpdate);
router.put("/", [userMiddleware], user.update);
router.get("/as-admin/:role", [userMiddleware], user.adminGet)

module.exports = router;

//split update and password change