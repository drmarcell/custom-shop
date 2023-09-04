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
const { body } = require('express-validator');

const router = express.Router();

router.get('/add-product', isAuth, getAddProduct);
router.post('/add-product', [
    body('title', 'The title must be at least 3 characters long.').isLength({ min: 3 }).trim(),
    body('imageUrl', 'Invalid image url').isURL(),
    body('price', 'Price is missing').isFloat(),
    body('description', 'The description must be min 5, max 400 characters long.').isLength({ min: 5, max: 400 }).trim()
],
isAuth, postAddProduct);
router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post('/edit-product', [
    body('title', 'The title must be at least 3 characters long.').isLength({ min: 3 }).trim(),
    body('imageUrl', 'Invalid image url').isURL(),
    body('price', 'Price is missing').isFloat(),
    body('description', 'The description must be min 5, max 400 characters long.').isLength({ min: 5, max: 400 }).trim()
], isAuth, postEditProduct);
router.get('/products', isAuth, getProducts);
router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;