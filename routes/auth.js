const express = require('express');
const { getLogin, postLogin, postLogout, getSignup, postSignup, getReset, postReset, getNewPassword } = require('../controllers/auth');

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/signup', getSignup);
router.post('/signup', postSignup);
router.post('/logout', postLogout);
router.get('/reset', getReset);
router.post('/reset', postReset);
router.get('/reset/:token', getNewPassword)

module.exports = router;