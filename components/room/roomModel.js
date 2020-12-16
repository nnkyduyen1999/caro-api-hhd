const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    userXId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    userOId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("room", roomSchema);
