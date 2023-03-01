const Cart = require("../models/cart");
const Product = require("../models/product");

exports.getIndex = async (_, res) => {
    try {
        const products = await Product.fetchAll();
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
        const products = await Product.fetchAll();
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
        const product = await Product.findById(productId);
        console.log(product);
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
    const products = await req.user.getCart();
    res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products
    });
};

exports.postCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.body;
        await req.user.deleteFromCart(productId);
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
    }
};

// exports.getCheckout = (_, res) => {
//     res.render("shop/checkout", {
//         pageTitle: "Checkout",
//         path: "/checkout"
//     });
// };

exports.getOrders = async (req, res) => {
    try {
        const orders = await req.user.getOrders();
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
        await req.user.addOrder();
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
    }
};
