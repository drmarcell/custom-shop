const express = require('express');
const {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    deleteProduct
} = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const router = express.Router();

router.get('/add-product', isAuth, getAddProduct);
router.post('/add-product', [
    body('title', 'The title must be at least 3 characters long.').isLength({ min: 3 }).trim(),
    body('price', 'Price is missing').isFloat(),
    body('description', 'The description must be min 5, max 400 characters long.').isLength({ min: 5, max: 400 }).trim()
],
isAuth, postAddProduct);
router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post('/edit-product', [
    body('title', 'The title must be at least 3 characters long.').isLength({ min: 3 }).trim(),
    body('price', 'Price is missing').isFloat(),
    body('description', 'The description must be min 5, max 400 characters long.').isLength({ min: 5, max: 400 }).trim()
], isAuth, postEditProduct);
router.get('/products', isAuth, getProducts);
router.delete('/product/:productId', isAuth, deleteProduct);

module.exports = router;