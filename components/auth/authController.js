const User = require("../user/userModel");
const bcrypt = require("bcryptjs");

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
      isAdmin: false
    });
    console.log(user);
    try {
      const savedUser = await user.save();
      res.send({ message: "Signup successfully!" });
    } catch (err) {
      res.status(400).send(err);
    }
  },
};
