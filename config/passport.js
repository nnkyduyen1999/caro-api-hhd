const passport = require('passport')
const passportJWT = require("passport-jwt");

const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('../components/user/userModel')

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.SECRET_TOKEN
    },
    (jwtPayload, done) => {
        return User.findById(jwtPayload._id)
            .then(user => {
                    return done(null, user);
                }
            ).catch(err => {
                return done(err);
            });
    }
))
