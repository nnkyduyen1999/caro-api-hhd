const express = require('express');
const router = express.Router();
const roomController = require('./roomController')

router.get('/', roomController.allWithPlayerUsername)

router.get('/:id', roomController.getById)

router.get('/with-player-info/:id', roomController.loadRoomWithPlayerInfoById)

// router.post('/', roomDAL.testRoom);

module.exports = router
