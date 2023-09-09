const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}))

const getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

const postLogin = (req, res, next) => {
    // Max-Age - how many seconds the cookie active
    // Secure - the cookie will be set if the page https
    // HttpOnly - cannot reach cookie from the client
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10');

    // through express-session (connect.sid file on browser network tab)
    // req.session.isLoggedIn = true;
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({
        email
    })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        email,
                        password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log('session save to database failed: ', err);
                            res.redirect('/');
                        });
                    }
                    res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        oldInput: {
                            email,
                            password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log('password compare process failed: ', err);
                    return res.redirect('/login');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: []
    });
  };
  
const postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
                confirmPassword
            },
            validationErrors: errors.array()
          });
    }
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            // return transporter.sendMail({
            //     to: email,
            //     from: process.env.HOST_EMAIL,
            //     subject: 'Signup completed',
            //     html: '<h1>You successfully signed up!</h1>'
            // });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
};

const getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
      errorMessage: message
    });
};

const postReset = (req, res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log('buffering failed: ', err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({
            email
        })
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with this email found');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: email,
                from: process.env.HOST_EMAIL,
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset.</p>
                    <p>Click this <a href="http://localhost:8000/reset/${token}">link</a> to set a new password.</p>
                `
            });
        })
        .catch(err => {
            console.log('searching for user has failed: ', err);
        });
    });
};

const getNewPassword = (req, res, next) => {
    const { token } = req.params;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        }
    })
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Reset Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })

}

const postNewPassword = (req, res, next) => {
    const { password, passwordToken, userId } = req.body;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {
            $gt: Date.now()
        }
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(() => {
        res.redirect('/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};

module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    postLogout,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword
}