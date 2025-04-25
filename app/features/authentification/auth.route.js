const router = require("express").Router();

const { authMiddleware } = require("../../middlewares/auth.middleware");
const auth = require("./auth.controller");

router.post("/signin", auth.signin);
// router.get("/get-session", [authMiddleware], auth.getAuthenticatedUser);
// router.delete("/delete-account", [authMiddleware], auth.deleteAccount);

module.exports = router;
