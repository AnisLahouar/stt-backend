const express = require("express");
const router = express.Router();
const controller = require('./reservation.controller')

router.post('/', controller.create)
router.get('/', controller.findAll)
router.get('/:id', controller.findOne)
router.get('/user/:phone', controller.findByPhone)
router.get('/property/:id', controller.findByProperty)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

module.exports = router