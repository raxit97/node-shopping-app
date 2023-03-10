const { body } = require('express-validator');
const User = require('../models/user');

const signupFormValidation = [
    body('email')
        .isEmail()
        .trim()
        .withMessage("Please enter a valid email")
        .custom(async (email) => {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error("Email aready exists. Please enter a different one.")
            }
        }),
    body('password', 'Please enter alphabets and numbers and at least 5 characters')
        .isLength({ min: 5 })
        .trim()
        .isAlphanumeric(),
    body('confirmPassword')
        .trim()
        .custom((confirmPassword, { req }) => {
            if (confirmPassword !== req.body.password) {
                throw new Error("Passwords do not match!!")
            }
            return true;
        })
];

const loginFormValidation = [
    body('email')
        .isEmail()
        .trim()
        .withMessage("Please enter a valid email"),
    body('password', 'Please enter alphabets and numbers and at least 5 characters')
        .trim()
        .isLength({ min: 5 })
        .isAlphanumeric(),
];

const addProductValidation = [
    body('title')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Please enter a valid title'),
    body('imageUrl')
        .isURL()
        .withMessage('Please enter a valid image URL'),
    body('price')
        .isFloat()
        .withMessage('Please enter a valid price'),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
        .withMessage('Please enter a valid description')
];

module.exports = { signupFormValidation, loginFormValidation, addProductValidation };
