const User = require("../user/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = `251340645881-213o968bvgh776f28e618k8t93obhgnd.apps.googleusercontent.com`;
const CLIENT_SECRET = `ZCY-BMk8g8GdhRVO-MRe5w_f`;
const REDIRECT_URL = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04U78YabY6AeBCgYIARAAGAQSNwF-L9IryvsLDN7-725ZbiQOk4HhFWnsDBn4j12JKYIJ4sM45108k8_QWpiU4MLIk-ls_ilIYic`;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

function sendMailTo(user) {
  const { username, email, password } = user;
  try {
    const accessToken = oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "nnkyduyen1999@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const token = jwt.sign(
      {
        username,
        email,
        password,
      },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "15m",
      }
    );

    const mailOptions = {
      from: "HHD TEAM <hhdteam@gmail.com>",
      to: "qui021098@gmail.com",
      subject: "Caro Game: Verify your CaroGame account",
      html: `
        <h3>Please click this link to activate account:</h3>
        <p>${process.env.ALLOW_ACCESS}/user/activate/${token}</p>
        <hr/>
      `,
    };
    const result = transport.sendMail(mailOptions);
    return {
      token: token,
      result: result,
    };
  } catch (err) {
    return err;
  }
}
module.exports = {
  signup: async (req, res, next) => {
    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist)
      return res.status(400).send({ message: "Username already exist" });

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist)
      return res.status(400).send({ message: "Email already exist" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    let tokenFromEmail = ``;
    try {
      //const savedUser = await user.save();
      const sentEmailResult = sendMailTo(user);
      if (sentEmailResult.token) {
        res.send({
          message:
            "Signup successfully! Please check your mail-box to verify email. Thank you...",
          tokenFromEmail: sentEmailResult.token,
        });
      }
    } catch (err) {
      res.status(400).send({ message: err });
    }
  },
  login: async (req, res, next) => {
    const existedUser = await User.findOne({ username: req.body.username });
    if (!existedUser) {
      return res.status(201).send({ errMsg: "User not found" });
    }

    const validPass = await bcrypt.compare(
      req.body.password,
      existedUser.password
    );
    if (!validPass) {
      return res.status(201).send({ errMsg: "Invalid password" });
    }

    const token = jwt.sign({ _id: existedUser._id }, process.env.SECRET_TOKEN);
    res.header("auth-token", token).json({
      userInfo: existedUser,
      token: token,
    });
  },
  loginGoogle: async (req, res, next) => {
    const { email, googleId, givenName, familyName } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({
        username: email.split("@")[0],
        password: "",
        email: email,
        phoneNumber: "",
        firstName: givenName,
        lastName: familyName,
        isOnline: false,
        isAdmin: false,
        googleID: googleId,
      });
      try {
        const savedUser = await newUser.save();
        console.log("savedUser", savedUser);
        const token = jwt.sign(
          { _id: savedUser._id },
          process.env.SECRET_TOKEN
        );
        return res.header("auth-token", token).status(200).json({
          userInfo: savedUser,
          token,
        });
      } catch (err) {
        console.log(err);
        return res.status(500);
      }
    }
    try {
      console.log("exist user", user);
      if (!user.googleID)
        user = await User.updateOne({ _id: user._id }, { googleID: googleId });
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
      res.header("auth-token", token).json({
        userInfo: user,
        token: token,
      });
    } catch (err) {
      res.status(500);
    }
  },
  loginFacebook: async (req, res, next) => {
    const { email, facebookId, givenName, familyName } = req.body;
    console.log(facebookId);
    let user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({
        username: email.split("@")[0],
        password: "",
        email: email,
        phoneNumber: "",
        firstName: givenName,
        lastName: familyName,
        isOnline: false,
        isAdmin: false,
        facebookID: facebookId,
      });
      try {
        const savedUser = await newUser.save();
        console.log("savedUser", savedUser);
        const token = jwt.sign(
          { _id: savedUser._id },
          process.env.SECRET_TOKEN
        );
        return res.header("auth-token", token).status(200).json({
          userInfo: savedUser,
          token,
        });
      } catch (err) {
        console.log(err);
        return res.status(500);
      }
    }
    try {
      if (!user.facebookID) {
        user = await User.updateOne(
          { _id: user._id },
          { facebookID: facebookId }
        );
      }
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
      res.header("auth-token", token).json({
        userInfo: user,
        token: token,
      });
    } catch (err) {
      res.status(500);
    }
  },
};
