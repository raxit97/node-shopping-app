const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = async (req, res) => {
    try {
        const { title, imageUrl, description, price } = req.body;
        const newProduct = new Product(title, description, imageUrl, price, null, req.user._id);
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
            editing: true
        });
    } catch (error) {
        console.error(error);
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        const { productId, title, imageUrl, description, price } = req.body;
        const product = new Product(title, description, imageUrl, price, productId);
        await product.save();
        res.redirect('/admin/products');   
    } catch (error) {
        console.error(error);
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.fetchAll();
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products"
        });   
    } catch (error) {
        console.error(error);
    }
};

exports.postDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        await Product.deleteById(productId);
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};