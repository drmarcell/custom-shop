const Product = require("../models/product");
const Cart = require('../models/cart');

const getProducts = (req, res, next) => {
    Product.fetchAllProduct(products => {
        res.render('shop/product-list', {
            products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });
};

const getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.getProductById(prodId, product => {
        res.render('shop/product-detail', {
            product,
            pageTitle: 'Product Detail',
            path: '/products'
        })
    })
    console.log('prodId is: ', prodId);
};

const getIndex = (req, res, next) => {
    Product.fetchAllProduct(products => {
        res.render('shop/index', {
            products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
}

const getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAllProduct(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            })
        });
    });
}

const postCart = (req, res, next) => {
    const { productId } = req.body;
    Product.getProductById(productId, product => {
        Cart.addProduct(product.id, product.price);
    });
    console.log('productId is: ', productId);
    res.redirect('/cart');
}

const getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    })
}

const postCartDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    Product.getProductById(productId, product => {
        Cart.deleteProduct(productId, product.price);
        res.redirect('/cart');
    });
}

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    })
}


module.exports = {
    getProducts,
    getProduct,
    getIndex,
    getCart,
    postCart,
    getOrders,
    getCheckout,
    postCartDeleteProduct
}