const express = require('express');
const router = express.Router();
const gameController = require('./gameController')

router.get('/:id', gameController.getGameById);

// router.post('/', gameController.testGame);
module.exports = router
