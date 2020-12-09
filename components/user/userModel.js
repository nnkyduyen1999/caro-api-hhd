const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    phoneNumber: String,
    firstName: String,
    lastName: String,
    isOnline: Boolean,
    isAdmin: Boolean,
    googleID: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    facebookID: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    }
});

module.exports = mongoose.model("user", userSchema);
