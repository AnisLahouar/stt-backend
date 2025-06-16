const express = require("express");
const router = express.Router();
const controller = require('./property.controller');
const { createMulterMemoryMiddleware } = require("../../middlewares/multer.middleware");
const { isAdminMiddleware } = require("../../middlewares/role.middleware");
const { userMiddleware, userIdMiddleware } = require("../../middlewares/user.middleware");

const multerMiddleware = createMulterMemoryMiddleware({
  fieldName: "images",
  maxCount: 8,
  maxFileSizeMB: 5
})

router.post('/', [userMiddleware, multerMiddleware], controller.create)
router.get('/public', controller.publicFindAll)
router.get('/', [userMiddleware], controller.findAll)
router.get('/owner/:id', controller.findByOwner)
router.get('/public/:id', controller.publicGetOne)
router.get('/:id', [userMiddleware], controller.findOne)
router.get('/count/:ownerId', [userMiddleware], controller.count)
router.put('/:id', [userMiddleware], controller.update)
router.put('/confirm/:id', [userMiddleware, isAdminMiddleware], controller.confirm)
router.delete('/:id', controller.delete)
router.delete('/:id/image/:imageId', [userIdMiddleware], controller.deleteImage)
router.put('/:id/images', [userMiddleware], controller.updateDefaultImage)
router.put('/image/create', [userMiddleware, multerMiddleware], controller.addImage)

module.exports = router