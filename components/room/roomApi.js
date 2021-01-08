const express = require('express');
const router = express.Router();
const roomController = require('./roomController')

router.get('/', roomController.all)

// router.post('/', roomDAL.testRoom);

module.exports = router
