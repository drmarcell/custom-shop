const express = require('express');
const { getLogin, postLogin, postLogout, getSignup, postSignup, getReset, postReset, getNewPassword, postNewPassword } = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();

router.get('/login', getLogin);
router.post(
    '/login',
    [
        body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .isLength({
                min: 5
            })
            .trim()
    ],
    postLogin
);
router.get('/signup', getSignup);
router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .custom(async (value, { req }) => {
                // if (value === 'test@test.com') {
                //     throw new Error('This email address is forbidden');
                // }
                // return true;
                return User.findOne({
                    email: req.body.email
                })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists, please pick a different one')
                        }
                    });
            })
            .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters'
            )
                .isLength({
                    min: 5
                })
                .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match')
                }
                return true;
            })
    ],
    postSignup
);
router.post('/logout', postLogout);
router.get('/reset', getReset);
router.post('/reset', postReset);
router.get('/reset/:token', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;