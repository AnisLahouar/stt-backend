const express = require("express");
const router = express.Router();
const controller = require('./reservation.controller');
const { userMiddleware } = require("../../middlewares/user.middleware");

router.post('/', [userMiddleware], controller.create)
router.get('/', controller.findAll)
router.get('/:id', controller.findOne)
router.get('/user/:phone', controller.findByPhone)
router.get('/property/:id', controller.findByProperty)
router.put('/:id', [userMiddleware], controller.update)
// router.delete('/:id', controller.delete)

module.exports = router

//exptected errors for gets:
// get => group by month (start and end date)
// add param for month