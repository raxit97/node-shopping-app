const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        isLoggedIn: req.isLoggedIn
    });
};

exports.postAddProduct = async (req, res) => {
    try {
        const { title, imageUrl, description, price } = req.body;
        const newProduct = new Product({ title, description, imageUrl, price, userId: req.user });
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};

exports.getEditProduct = async (req, res) => {
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
            isLoggedIn: req.isLoggedIn
        });
    } catch (error) {
        console.error(error);
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        const { productId, title, imageUrl, description, price } = req.body;
        const product = await Product.findById(productId);
        product.title = title;
        product.imageUrl = imageUrl;
        product.description = description;
        product.price = price;
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('userId');
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products",
            isLoggedIn: req.isLoggedIn
        });
    } catch (error) {
        console.error(error);
    }
};

exports.postDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        await Product.findByIdAndRemove(productId);
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};