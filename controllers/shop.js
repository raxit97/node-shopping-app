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
