const express = require('express');
const {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    postDeleteProduct
} = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, getAddProduct);
router.post('/add-product', isAuth, postAddProduct);
router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post('/edit-product', isAuth, postEditProduct);
router.get('/products', isAuth, getProducts);
router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;