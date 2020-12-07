const User = require("../user/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      phoneNumber: req.body.phoneNumber,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      isOnline: false,
      isAdmin: false,
    });
    
    try {
      const savedUser = await user.save();
      res.send({ message: "Signup successfully!" });
    } catch (err) {
      res.status(400).send({ message: err });
    }
  },

  login: async (req, res, next) => {
    const existedUser = await User.findOne({ username: req.body.username });
    if (!existedUser) {
      return res.status(400).send("User not found");
    }

    const validPass = await bcrypt.compare(
      req.body.password,
      existedUser.password
    );
    if (!validPass) {
      return res.status(400).send("Invalid password");
    }

    const token = jwt.sign({ _id: existedUser._id }, process.env.SECRET_TOKEN);
    res.header("auth-token", token).json({
      _id: existedUser._id,
      token: token,
    });
  },
};
