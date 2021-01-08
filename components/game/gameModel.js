const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
    xPlayer: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    oPlayer: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: 'Room'
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    history: {
        type: [{squares: [], location: Number, chat: []}],
        default: [{squares: [], location: Number, chat: []}]
    },
    winningLine: [Number],
    winner: String,
    isFinish: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Game", gameSchema);
