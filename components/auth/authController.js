const User = require("../user/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = `251340645881-213o968bvgh776f28e618k8t93obhgnd.apps.googleusercontent.com`;
const CLIENT_SECRET = `ZCY-BMk8g8GdhRVO-MRe5w_f`;
const REDIRECT_URL = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04U78YabY6AeBCgYIARAAGAQSNwF-L9IryvsLDN7-725ZbiQOk4HhFWnsDBn4j12JKYIJ4sM45108k8_QWpiU4MLIk-ls_ilIYic`;
const USER_EMAIL = `nnkyduyen1999@gmail.com`;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

function sendMailTo(mailOptions) {
  try {
    const accessToken = oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const result = transport.sendMail(mailOptions);
    return {
      result: result,
      message: `OK`,
    };
  } catch (err) {
    return err;
  }
}
module.exports = {
  signup: async (req, res, next) => {
    const { username, email, password, firstName, lastName } = req.body;

    const usernameExist = await User.findOne({ username: username });
    if (usernameExist)
      return res.status(400).send({ message: "Username already exist" });

    const emailExist = await User.findOne({ email: email });
    if (emailExist)
      return res.status(400).send({ message: "Email already exist" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: username,
      password: hashedPassword,
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    const token = jwt.sign(
      {
        username,
        email,
        hashedPassword,
      },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "15m",
      }
    );

    const mailOptions = {
      from: "HHD TEAM <hhdteam@gmail.com>",
      to: user.email,
      subject: "Caro Game: Verify your CaroGame account",
      html: `
        <h3>Please click this link to continue:</h3>
        <p>${process.env.ALLOW_ACCESS}/user/activate/${token}</p>
        <hr/>
      `,
    };

    try {
      const savedUser = await user.save();
      const sentEmailResult = sendMailTo(mailOptions);
      console.log(sentEmailResult);
      if (sentEmailResult.message === `OK`) {
        res.send({
          message:
            "Signup successfully! Please check your mail-box to verify email. Thank you...",
          tokenFromEmail: token,
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

    if (!existedUser.isValidate) {
      return res.status(201).send({ errMsg: "This email is not validated yet."});
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
        firstName: givenName,
        lastName: familyName,
        googleId: googleId,
        isValidate: true,
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
      if (!user.googleId)
        user = await User.updateOne({ _id: user._id }, { googleId: googleId });
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
        firstName: givenName,
        lastName: familyName,
        facebookId: facebookId,
        isValidate: true,
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
      if (!user.facebookId) {
        user = await User.updateOne(
          { _id: user._id },
          { facebookId: facebookId }
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
  activateEmail: async (req, res, next) => {
    const { token } = req.body;
    if (token) {
      jwt.verify(token, process.env.SECRET_TOKEN, async (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Expired link. Sign up again :((" });
        } else {
          const { username, email, password } = jwt.decode(token);
          const updatedUser = await User.findOneAndUpdate(
            { username: username, email: email },
            { isValidate: true }
          );
          if (updatedUser) {
            res.status(200).json({
              message: "Email is validated. Now you can login...",
            });
          } else {
            res
              .status(401)
              .json({ message: "Error happening when updating user. Sorry." });
          }
        }
      });
    } else {
      res.status(401).json({ message: "Error happening, please try again..." });
    }
  },
  sentMailForgetPassword: async (req, res, next) => {
    const exitedUser = await User.findOne({ email: req.body.email });
    if (exitedUser) {
      try {
        const { _id, email } = exitedUser;
        const token = jwt.sign({ _id, email }, process.env.SECRET_TOKEN, {
          expiresIn: "15m",
        });
        const mailOptions = {
          from: "HHD TEAM <hhdteam@gmail.com>",
          to: email,
          subject: "Caro Game: Reset password for your CaroGame account",
          html: `
              <h3>Please click this link to continue:</h3>
              <p>${process.env.ALLOW_ACCESS}/user/reset-password/${token}</p>
              <hr/>
            `,
        };
        const sentEmailResult = sendMailTo(mailOptions);
        if (sentEmailResult.message === `OK`) {
          res.status(200).send({
            token: token,
            message: "Email sent. Please check your email to reset password...",
          });
        }
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    } else {
      res
        .status(400)
        .send({ message: "This email is invalid or not existed." });
    }
  },
  resetPasswordByEmail: async (req, res, next) => {
    const { token, newPassword} = req.body;
    if (token && newPassword) {
      try {
        jwt.verify(token, process.env.SECRET_TOKEN, async (err, decoded) => {
          if (err) {
            return res
              .status(401)
              .json({ message: "Expired link. Please try again :((" });
          } else {
            const { _id } = jwt.decode(token);

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            
            const updatedUser = await User.findByIdAndUpdate(_id, {
              password: hashedNewPassword,
            });

            if (updatedUser) {
              res.status(200).json({
                message: "Your password is successfully updated.",
              });
            } else {
              res.status(401).json({
                message: "Error happening when updating user. Sorry.",
              });
            }
          }
        });
      } catch (err) {
        res.status(400).send({ message: "Error" });
      }
    } else {
      res.status(400).send({ message: "Error happening. Please try again." });
    }
  },
};
