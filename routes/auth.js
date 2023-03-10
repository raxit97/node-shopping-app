const express = require('express');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { signupFormValidation, loginFormValidation } = require('../utils/validation-util');
const router = express.Router();

router.get('/signup', (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/signup", {
        pageTitle: "Signup",
        path: "/signup",
        errorMessage: message,
        oldInput: { email: "", password: "", confirmPassword: "" },
        validationErrors: []
    });
});

router.post("/signup", signupFormValidation, async (req, res) => {
        const { email, password, confirmPassword } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("auth/signup", {
                pageTitle: "Signup",
                path: "/signup",
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password, confirmPassword },
                validationErrors: errors.array()
            });
        }
        const hashedPassword = await bcryptjs.hash(password, 12);
        const newUser = new User({
            email,
            password: hashedPassword,
            cart: { items: [] }
        });
        await newUser.save();
        res.redirect('/login');
    });

router.get('/login', (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: message,
        oldInput: { email: "", password: "" },
        validationErrors: []
    });
});

router.post('/login', loginFormValidation, async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("auth/login", {
                pageTitle: "Login",
                path: "/login",
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password },
                validationErrors: errors.array()
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }
        const doesPasswordMatch = await bcryptjs.compare(password, user.password);
        if (doesPasswordMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(() => res.redirect('/'));
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/login');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/reset-password', (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/email-verification", {
        pageTitle: "Reset Password",
        path: "/reset-password",
        errorMessage: message
    });
});

router.post('/verify-email', (req, res) => {
    const { email } = req.body;
    crypto.randomBytes(32, async (_, buffer) => {
        const token = buffer.toString('hex');
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'No user with that email found');
            return res.redirect('/reset-password');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        res.redirect(`/reset-password/${token}`);
    });
});

router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset-password", {
        pageTitle: "Reset Password",
        path: "/reset-password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
    });
});

router.post('/reset-password', async (req, res) => {
    const { userId, newPassword, passwordToken } = req.body;
    const user = await User.findOne({
        _id: userId,
        resetTokenExpiration: { $gt: Date.now() },
        resetToken: passwordToken
    });
    const password = await bcryptjs.hash(newPassword, 12);
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect('/login');
});

module.exports = router;
