const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
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
        errorMessage: message
    });
});

router.post("/signup", async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        req.flash('error', 'Email aready exists. Please enter a different one.');
        return res.redirect('/signup');
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
        errorMessage: message
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
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

module.exports = router;
