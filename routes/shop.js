const express = require('express');
const { getIndex, getProducts, getProduct, getCart, postCart, getOrders, getCheckout, postCartDeleteProduct } = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProduct);
router.get('/cart', getCart);
router.post('/cart', postCart);
router.post('/cart-delete-item', postCartDeleteProduct);
router.get('/orders', getOrders);
router.get('/checkout', getCheckout);

module.exports = router;