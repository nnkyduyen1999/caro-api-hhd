const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
require('./config/passport')
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./components/auth/authApi"));
app.use("/user", passport.authenticate('jwt', {session: false}), require("./components/user/userApi"));
app.use("/game", passport.authenticate('jwt', {session: false}), require('./components/game/gameApi'));
app.use("/chat", passport.authenticate('jwt', {session: false}), require('./components/chat/chatApi'));
app.use("/room", passport.authenticate('jwt', {session: false}), require('./components/room/roomApi'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// connect db
mongoose
    .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.log("Error connecting to database");
    });

module.exports = app;
