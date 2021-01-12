const express = require('express');
const router = express.Router();
const userController = require('./userController')

router.get('/online', userController.getOnlineUsers)
router.get('/top-players', userController.getTopPlayers);

module.exports = router