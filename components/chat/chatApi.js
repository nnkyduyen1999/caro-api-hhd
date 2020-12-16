const express = require('express');
const router = express.Router();
const chatController = require('./chatController')

router.get('/:roomId', chatController.joinChatById);

module.exports = router
