const router = require("express").Router();

const folder = require("./folder.controller");

router.get("/", folder.getAll);


module.exports = router;
