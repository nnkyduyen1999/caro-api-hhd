const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    avatar: String,
    firstName: String,
    lastName: String,
    password: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    isValidate: {
        type: Boolean,
        default: false
    },
    winCount: {
        type: Number,
        default: 0
    },
    loseCount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    trophy: {
        type: Number,
        default: 0
    },
    createTime: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("User", userSchema);
