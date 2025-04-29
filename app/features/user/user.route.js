const router = require("express").Router();

const user = require("./user.controller");

router.post("/", user.create);
router.get("/", user.findAll);

module.exports = router;
