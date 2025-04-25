const multer = require("multer");
const router = require("express").Router();
const client = require("./client.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });


router.post("/create-client", upload.single("image"), client.createClient);
router.get("/get-client",[authMiddleware], client.getClient);

module.exports = router;
