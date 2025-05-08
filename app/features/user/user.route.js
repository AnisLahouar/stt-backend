const router = require("express").Router();

const user = require("./user.controller");

router.post("/", user.create);
router.get("/", user.findAll);
router.get("/:id", user.findOne);
router.put("/:id", user.update);

module.exports = router;
