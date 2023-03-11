const Product = require("../models/product");
const { validationResult } = require('express-validator');
const { deleteFile } = require("../utils/file-utils");

exports.getAddProduct = (_, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = async (req, res, next) => {
    try {
        const { title, description, price } = req.body;
        const image = req.file;
        const errors = validationResult(req);
        if (!errors.isEmpty() || !image) {
            const imageErrorMessage = "Attached file is not an image";
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                product: { title, description, price },
                errorMessage: image ? errors.array()[0].msg :imageErrorMessage,
                validationErrors: errors.array()
            });
        }
        const imageUrl = image.path;
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
            errorMessage: null,
            validationErrors: []
        });
    } catch (error) {
        next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    try {
        const { productId, title, description, price } = req.body;
        const image = req.file;
        const errors = validationResult(req);
        if (!errors.isEmpty() || !image) {
            const imageErrorMessage = "Attached file is not an image";
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: true,
                hasError: true,
                product: { title, image, description, price },
                errorMessage: image ? errors.array()[0].msg : imageErrorMessage,
                validationErrors: errors.array()
            });
        }
        const product = await Product.findById(productId);
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        if (image) {
            deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
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

exports.deleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            next(new Error('Product Not Found'));
        }
        deleteFile(product.imageUrl);
        await Product.deleteOne({ _id: productId, userId: req.user._id });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};