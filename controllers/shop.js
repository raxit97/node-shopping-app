const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Order = require("../models/order");
const Product = require("../models/product");

const ITEMS_PER_PAGE = 1;

exports.getIndex = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const totalProducts = await Product.find().count();
        const products = await Product
            .find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        res.render("shop/index", {
            products,
            pageTitle: "Shop",
            path: "/",
            totalProducts,
            currentPage: page,
            hasNextPage: (ITEMS_PER_PAGE * page) < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const totalProducts = await Product.find().count();
        const products = await Product
            .find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        res.render("shop/product-list", {
            products,
            pageTitle: "Shop",
            path: "/",
            totalProducts,
            currentPage: page,
            hasNextPage: (ITEMS_PER_PAGE * page) < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
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

exports.getInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new Error("No order found!!"));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error("Unauthorized"));
        }
        const invoiceFileName = `Invoice-${orderId}.pdf`;
        const invoiceFilePath = path.join('data', 'invoices', invoiceFileName);
        const pdfDocument = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceFileName}"`);
        pdfDocument.pipe(fs.createWriteStream(invoiceFilePath));
        pdfDocument.pipe(res);
        pdfDocument.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDocument.text('---------------------------');
        let totalPrice = 0;
        order.items.forEach((product) => {
            totalPrice += product.quantity * product.price;
            pdfDocument.fontSize(14).text(`${product.title} - ${product.quantity} x $${product.price}`);
        });
        pdfDocument.text('\n');
        pdfDocument.fontSize(20).text(`Total Price: $${totalPrice}`);
        pdfDocument.end();
        // const file = fs.createReadStream(invoiceFilePath);
        // file.pipe(res);
    } catch (error) {
        next(error);
    }
};
