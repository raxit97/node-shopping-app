const Order = require("../models/order");
const Product = require("../models/product");

exports.getIndex = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render("shop/product-list", {
            products,
            pageTitle: "Shop",
            path: "/"
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render("shop/product-list", {
            products,
            pageTitle: "Products",
            path: "/products"
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductDetail = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        res.render("shop/product-detail", {
            product,
            pageTitle: product.title,
            path: `/products`
        });
    } catch (error) {
        next(error);
    }
};

exports.getCart = async (req, res) => {
    const userWithProducts = await req.user.populate('cart.items.productId');
    const products = userWithProducts.cart.items.map(item => {
        return {
            ...item.productId._doc,
            quantity: item.quantity
        };
    });
    res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products
    });
};

exports.postCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
};

exports.deleteCartItem = async (req, res, next) => {
    try {
        const { productId } = req.body;
        await req.user.deleteFromCart(productId);
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
};

// exports.getCheckout = (req, res) => {
//     res.render("shop/checkout", {
//         pageTitle: "Checkout",
//         path: "/checkout"
//     });
// };

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ "user.userId": req.user._id });
        res.render("shop/orders", {
            orders,
            pageTitle: "Your Orders",
            path: "/orders"
        });
    } catch (error) {
        next(error);
    }
};

exports.postCreateOrder = async (req, res, next) => {
    try {
        const userWithProducts = await req.user.populate('cart.items.productId');
        const products = userWithProducts.cart.items.map(item => {
            return {
                ...item.productId._doc,
                quantity: item.quantity
            };
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user._id
            },
            items: products
        });
        await order.save();
        await req.user.clearCart();
        res.redirect('/orders');
    } catch (error) {
        next(error);
    }
};
