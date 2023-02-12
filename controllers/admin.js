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
        await req.user.createProduct({
            title, description, imageUrl, price
        });
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // const product = await Product.findByPk(productId);
        const products = await req.user.getProducts({
            where: { id: productId }
        });
        const product = products[0];
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
        await Product.update({
            title, description, imageUrl, price
        }, {
            where: {
                id: productId
            }
        });
        res.redirect('/admin/products');   
    } catch (error) {
        console.error(error);
    }
};

exports.getProducts = async (req, res) => {
    // const products = await Product.findAll();
    const products = await req.user.getProducts();
    res.render("admin/products", {
        products,
        pageTitle: "Admin Products",
        path: "/admin/products"
    });

};

exports.postDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        await Product.destroy({
            where: {
                id: productId
            }
        });
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
    }
};