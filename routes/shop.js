const express = require('express');
const { getProducts, getIndex, getCart, getCheckout, getOrders, getProductDetail, postCart, deleteCartItem, postCreateOrder } = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProductDetail);
router.get('/cart', getCart);
router.post('/cart', postCart);
router.post('/cart-delete-item', deleteCartItem);
router.get('/checkout', getCheckout);
router.get('/orders', getOrders);
router.post('/create-order', postCreateOrder);

module.exports = router;
