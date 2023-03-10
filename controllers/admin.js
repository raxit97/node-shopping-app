const Product = require("../models/product");
const { validationResult } = require('express-validator');

exports.getAddProduct = (_, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null
    });
};

exports.postAddProduct = async (req, res, next) => {
    try {
        const { title, imageUrl, description, price } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                product: { title, imageUrl, description, price },
                errorMessage: errors.array()[0].msg
            });
        }
        const newProduct = new Product({ title, description, imageUrl, price, userId: req.user });
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};

exports.getEditProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            res.redirect('/404');
        }
        res.render('admin/edit-product', {
            product,
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: false,
            errorMessage: null
        });
    } catch (error) {
        next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    try {
        const { productId, title, imageUrl, description, price } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: true,
                hasError: true,
                product: { title, imageUrl, description, price },
                errorMessage: errors.array()[0].msg
            });
        }
        const product = await Product.findById(productId);
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        product.imageUrl = imageUrl;
        product.description = description;
        product.price = price;
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ userId: req.user._id });
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products"
        });
    } catch (error) {
        next(error);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.body;
        await Product.deleteOne({ _id: productId, userId: req.user._id });
        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};