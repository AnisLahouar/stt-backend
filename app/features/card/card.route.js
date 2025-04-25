const router = require("express").Router();

const card = require("./card.controller");

router.get("/", card.getAll);
router.post("/create", card.create);
router.put("/update/:id", card.update);
router.delete("/delete/:id",card.delete)


module.exports = router;
