const router = require("express").Router();

const others = require("./others.controller");

router.get("/", others.getAll);
router.post("/create", others.create);
router.put("/update/:id", others.update);
router.delete("/delete/:id", others.delete);


module.exports = router;
