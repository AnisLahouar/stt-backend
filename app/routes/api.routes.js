const router = require("express").Router();
const authRoutes = require("../features/authentification/auth.route");
const serviceRoutes = require("../features/service/service.route");
const cardRoutes = require("../features/card/card.route");
const folderRoutes = require("../features/folder/folder.route");
const othersRoutes = require("../features/others/others.route");

const propertyRoutes = require("../routes/property.routes");
const reservationRoutes = require("../routes/reservation.routes");

const { authMiddleware } = require("../middlewares/auth.middleware");


//fix folders => sub folders into features, featureFolder include files: routes & controller
router.use("/auth", authRoutes);
router.use("/property", propertyRoutes);
router.use("/reservation", reservationRoutes);
// router.use("/service",[authMiddleware], serviceRoutes);
// router.use("/card",[authMiddleware], cardRoutes);
// router.use("/folder",[authMiddleware], folderRoutes);
// router.use("/others",[authMiddleware], othersRoutes);




module.exports = router;
