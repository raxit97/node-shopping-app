const express = require('express');
const { getProducts, getIndex, getCart, getOrders, getProductDetail, postCart, deleteCartItem, postCreateOrder } = require('../controllers/shop');
const authMiddleware = require('../middleware/is-auth');

const router = express.Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProductDetail);
router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, postCart);
router.post('/cart-delete-item', authMiddleware, deleteCartItem);
// router.get('/checkout', authMiddleware, getCheckout);
router.get('/orders', authMiddleware, getOrders);
router.post('/create-order', authMiddleware, postCreateOrder);

module.exports = router;
