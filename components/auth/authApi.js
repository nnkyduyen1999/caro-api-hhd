const express = require('express');
const router = express.Router();
const authController = require('./authController');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/login-google', authController.loginGoogle);
router.post('/login-facebook', authController.loginFacebook);
router.post('/activate', authController.activateEmail);
router.post('/forget-password', authController.sentMailForgetPassword);
router.post('/reset-password', authController.resetPasswordByEmail);

module.exports = router;
