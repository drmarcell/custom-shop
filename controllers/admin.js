const Product = require("../models/product");

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        isEditing: false
    })
};

const postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(null, title, imageUrl, price, description);
    product.save();
    res.redirect('/products');
};

const getEditProduct = (req, res, next) => {
    const editMode = Boolean(req.query.edit);
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.getProductById(productId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            product,
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            isEditing: editMode
        })
    })
};

const postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;
    const product = new Product(productId, title, imageUrl, price, description);
    product.save();
    res.redirect('/admin/products');
}

const getProducts = (req, res, next) => {
    Product.fetchAllProduct(products => {
        res.render('admin/products', {
            products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
};

const postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect('/admin/products');
};

module.exports = {
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    getProducts,
    postDeleteProduct
}