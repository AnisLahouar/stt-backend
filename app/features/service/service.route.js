const router = require("express").Router();

const service = require("./service.controller");

router.get("/", service.getAll);
router.get("/all", service.getAllForExport);
router.post("/create", service.create);
router.put("/update/:id", service.update);
router.delete("/delete/:id", service.delete);


module.exports = router;
