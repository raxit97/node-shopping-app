const express = require('express');
const { getAddProduct, postAddProduct, getProducts, getEditProduct, postEditProduct, postDeleteProduct } = require('../controllers/admin');
const authMiddleware = require('../middleware/is-auth');
const router = express.Router();

router.get('/add-product', authMiddleware, getAddProduct);
router.post('/add-product', authMiddleware, postAddProduct);
router.get('/products', authMiddleware, getProducts);
router.get('/edit-product/:productId', authMiddleware, getEditProduct);
router.post('/edit-product', authMiddleware, postEditProduct);
router.post('/delete-product', authMiddleware, postDeleteProduct);

module.exports = router;
