const express = require('express');
const { getAddProduct, postAddProduct, getProducts, getEditProduct, postEditProduct, deleteProduct } = require('../controllers/admin');
const authMiddleware = require('../middleware/is-auth');
const { addProductValidation } = require('../utils/validation-util');
const router = express.Router();

router.get('/add-product', authMiddleware, getAddProduct);
router.post('/add-product', authMiddleware, addProductValidation, postAddProduct);
router.get('/products', authMiddleware, getProducts);
router.get('/edit-product/:productId', authMiddleware, getEditProduct);
router.post('/edit-product', authMiddleware, addProductValidation, postEditProduct);
router.delete('/product/:productId', authMiddleware, deleteProduct);

module.exports = router;
