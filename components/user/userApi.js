const express = require('express');
const router = express.Router();
const userController = require('./userController')

router.get('/online', userController.getOnlineUsers)

module.exports = router