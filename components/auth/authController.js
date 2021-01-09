const User = require("../user/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
    signup: async (req, res, next) => {
        const usernameExist = await User.findOne({username: req.body.username});
        if (usernameExist)
            return res.status(400).send({message: "Username already exist"});

        const emailExist = await User.findOne({email: req.body.email});
        if (emailExist)
            return res.status(400).send({message: "Email already exist"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });

        try {
            const savedUser = await user.save();
            res.send({message: "Signup successfully!"});
        } catch (err) {
            res.status(400).send({message: err});
        }
    },
    login: async (req, res, next) => {
        const existedUser = await User.findOne({username: req.body.username});
        if (!existedUser) {
            return res.status(201).send({errMsg: "User not found"});
        }

        const validPass = await bcrypt.compare(
            req.body.password,
            existedUser.password
        );
        if (!validPass) {
            return res.status(201).send({errMsg: "Invalid password"});
        }

        const token = jwt.sign({_id: existedUser._id}, process.env.SECRET_TOKEN);
        res.header("auth-token", token).json({
            userInfo: existedUser,
            token: token,
        });
    },
    loginGoogle: async (req, res, next) => {
        const {email, googleId, givenName, familyName} = req.body;
        let user = await User.findOne({email});
        if (!user) {
            const newUser = new User({
                username: email.split('@')[0],
                password: "",
                email: email,
                firstName: givenName,
                lastName: familyName,
                googleId: googleId,
                isValidate: true
            });

            try {
                const savedUser = await newUser.save();
                console.log("savedUser", savedUser);
                const token = jwt.sign({_id: savedUser._id}, process.env.SECRET_TOKEN);
                return res.header("auth-token", token).status(200).json({
                    userInfo: savedUser,
                    token
                });
            } catch (err) {
                console.log(err);
                return res.status(500);
            }
        }
        try {
            console.log("exist user", user);
            if(!user.googleId)
                user = await User.updateOne({_id: user._id}, {googleId: googleId})
            const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);
            res.header("auth-token", token).json({
                userInfo: user,
                token: token,
            });
        } catch (err) {
            res.status(500);
        }
    },
    loginFacebook: async (req, res, next) => {
        const {email, facebookId, givenName, familyName} = req.body;
        console.log(facebookId);
        let user = await User.findOne({email});
        if (!user) {
            const newUser = new User({
                username: email.split('@')[0],
                password: "",
                email: email,
                firstName: givenName,
                lastName: familyName,
                facebookId: facebookId,
                isValidate: true
            });
            try {
                const savedUser = await newUser.save();
                console.log("savedUser", savedUser);
                const token = jwt.sign({_id: savedUser._id}, process.env.SECRET_TOKEN);
                return res.header("auth-token", token).status(200).json({
                    userInfo: savedUser,
                    token
                });
            } catch (err) {
                console.log(err);
                return res.status(500);
            }
        }
        try {
            if(!user.facebookId) {
                user = await User.updateOne({_id: user._id}, {facebookId: facebookId})
            }
            const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);
            res.header("auth-token", token).json({
                userInfo: user,
                token: token,
            });
        } catch (err) {
            res.status(500);
        }
    },
};
