const Cart = require("../models/cart");
const Product = require("../models/product");

exports.getIndex = async (_, res) => {
    try {
        const products = await Product.findAll();
        res.render("shop/product-list", {
            products,
            pageTitle: "Shop",
            path: "/"
        });
    } catch (error) {
        console.error(error);
    }
};

exports.getProducts = async (_, res) => {
    try {
        const products = await Product.findAll();
        res.render("shop/product-list", {
            products,
            pageTitle: "Products",
            path: "/products"
        });
    } catch (error) {
        console.error(error);
    }
};

exports.getProductDetail = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        res.render("shop/product-detail", {
            product,
            pageTitle: product.title,
            path: `/products`
        });
    } catch (error) {
        console.error(error);
    }
};

exports.getCart = async (req, res) => {
    const cart = await req.user.getCart();
    const cartProducts = await cart.getProducts();
    const products = cartProducts.map(product => product.dataValues);
    res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products
    });
};

exports.postCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: productId } });
        let newQuantity = 1;
        if (products && products[0]) {
            const existingProduct = products[0].dataValues;
            newQuantity = existingProduct.cartItem.quantity + 1;
        }
        const product = await Product.findByPk(productId);
        cart.addProduct(product, { through: { quantity: newQuantity } });
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: productId } });
        const product = products[0].dataValues;
        await product.cartItem.destroy();
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
    }
};

exports.getCheckout = (_, res) => {
    res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout"
    });
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await req.user.getOrders({ include: ['products'] });
        console.log(orders[0].products[0]);
        res.render("shop/orders", {
            orders,
            pageTitle: "Your Orders",
            path: "/orders"
        });
    } catch (error) {
        console.error(error);
    }
};

exports.postCreateOrder = async (req, res) => {
    try {
        const cart = await req.user.getCart();
        const cartProducts = await cart.getProducts();
        const order = await req.user.createOrder();
        const orderProducts = cartProducts.map(product => {
            product.orderItem = { quantity: product.dataValues.cartItem.quantity }
            return product;
        });
        await order.addProducts(orderProducts);
        await cart.setProducts(null);
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
    }
};
