const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    createTime: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        default: ''
    },
    timeStep: {
        type: Number,
        default: 60
    },
});

module.exports = mongoose.model("Room", roomSchema);
