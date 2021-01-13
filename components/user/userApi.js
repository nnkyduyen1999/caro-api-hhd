const express = require('express');
const router = express.Router();
const userController = require('./userController')

router.get('/online', userController.getOnlineUsers)
router.get('/top-players', userController.getTopPlayers);
router.get('/profile/:id', userController.getUserById);
router.get('/finished-game/:id', userController.getFinishedGamesById);
module.exports = router