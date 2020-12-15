const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
    userXId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    userOId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("game", gameSchema);
