const mongoose = require("mongoose");
const { BOARD_SIZE } = require('../../global/constant')

const Schema = mongoose.Schema;

const gameSchema = new Schema({
    xPlayer: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    oPlayer: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    history: {
        type: []
    },
    winningLine: {
        type: []
    },
    winner: {
        type: String,
    },
    isFinish: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Game", gameSchema);
