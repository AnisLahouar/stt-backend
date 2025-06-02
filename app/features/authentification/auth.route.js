const router = require("express").Router();

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { userMiddleware } = require("../../middlewares/user.middleware");
const auth = require("./auth.controller");

router.post("/signin", auth.signin);
router.get("/get-session", [userMiddleware], auth.getAuthenticatedUser);
// router.delete("/delete-account", [authMiddleware], auth.deleteAccount);

module.exports = router;
