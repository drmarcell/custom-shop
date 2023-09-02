const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

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
        errorMessage: message
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
    User.findOne({
        email
    })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
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
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log('password compare process failed: ', err);
                    return res.redirect('/login');
                })
        })
        .catch(err => {
            console.log('cannot get user: ', err);
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
      errorMessage: message
    });
  };
  
const postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    User.findOne({
        email
    })
    .then(userDoc => {
        if (userDoc) {
            req.flash('error', 'Email already exists, please pick a different one');
            return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12)
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
                return transporter.sendMail({
                    to: email,
                    from: process.env.HOST_EMAIL,
                    subject: 'Signup completed',
                    html: '<h1>You successfully signed up!</h1>'
                });
            })
            .catch(err => {
                console.log(err);
            })
    })
    .catch(err => console.log('error when trying to sign up: ', err));
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
            userId: user._id.toString()
        });
    })
    .catch(err => {
        console.log('cannot render reset password page: ', err);
    })

}

module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    postLogout,
    getReset,
    postReset,
    getNewPassword
}