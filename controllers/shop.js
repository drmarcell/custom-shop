const Product = require("../models/product");
const Cart = require('../models/cart');
const Order = require('../models/order');

const getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            console.log('products are: ', products);
            res.render('shop/product-list', {
                products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.error('error when getting all products: ', err);
        });
    // Product.fetchAllProduct()
    //     .then(([products, fieldData]) => {
    //         res.render('shop/product-list', {
    //             products,
    //             pageTitle: 'All Products',
    //             path: '/products'
    //         });
    //     })
    //     .catch(err => console.log('cannot get products from db: ', err));
};

const getProduct = (req, res, next) => {
    const { productId } = req.params;

    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product,
                pageTitle: 'Product Detail',
                path: '/products'
            });
        })
        .catch(err => {
            console.log('cannot get product by id: ', err);
        })

    // sequelize
    // Product.findByPk(prodId)
    //     .then(product => {
    //         res.render('shop/product-detail', {
    //             product,
    //             pageTitle: 'Product Detail',
    //             path: '/products'
    //         });
    //     })
    //     .catch(err => {
    //         console.log('cannot get product by id: ', err);
    //     })

    // Product.getProductById(prodId)
    //     .then(([product, _]) => {
    //         res.render('shop/product-detail', {
    //             product: product[0],
    //             pageTitle: 'Product Detail',
    //             path: '/products'
    //         });
    //     })
    //     .catch(err => console.log('cannot get product details: ', err));
    // console.log('prodId is: ', prodId);
};

const getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.error('error when getting all products: ', err);
        });
    // Product.fetchAllProduct()
    //   .then(([products, fieldData]) => {
    //       res.render('shop/index', {
    //           products,
    //           pageTitle: 'Shop',
    //           path: '/'
    //       });
    //   })
    //   .catch(err => console.log('cannot get products from the database', err));
}

const getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const productsOnCart = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: productsOnCart
            })
        });
    // .then(products => {
    //     res.render('shop/cart', {
    //         path: '/cart',
    //         pageTitle: 'Your Cart',
    //         products
    //     })
    // })

    // req.user.getCart()
    //     .then(cart => {
    //         return cart.getProducts()
    //             .then(products => {
    //                 res.render('shop/cart', {
    //                     pageTitle: 'Your Cart',
    //                     path: '/cart',
    //                     products
    //                 })
    //             })
    //             .catch(err => {
    //                 console.log('cannot get products of the cart: ', err);
    //             })

    //     })
    //     .catch(err => {
    //         console.log('cannot get cart: ', err);
    //     });

    // Cart.getCart(cart => {
    //     Product.fetchAllProduct(products => {
    //         const cartProducts = [];
    //         for (product of products) {
    //             const cartProductData = cart.products.find(prod => prod.id === product.id);
    //             if (cartProductData) {
    //                 cartProducts.push({ productData: product, qty: cartProductData.qty });
    //             }
    //         }
    //         res.render('shop/cart', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             products: cartProducts
    //         })
    //     });
    // });
}

const postCart = (req, res, next) => {
    const { productId } = req.body;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        });

    // let fetchedCart;
    // let newQuantity = 1
    // req.user.getCart()
    //     .then(cart => {
    //         fetchedCart = cart
    //         return cart.getProducts({ where: { id: productId } })
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0];
    //         }
    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         }
    //         return Product.findByPk(productId);
    //     })
    //     .then(product => {
    //         return fetchedCart.addProduct(product, {
    //             through: {
    //                 quantity: newQuantity
    //             }
    //         });
    //     })
    //     .then(() => {
    //         res.redirect('/cart');
    //     })

    // Product.getProductById(productId, product => {
    //     Cart.addProduct(product.id, product.price);
    // });
    // console.log('productId is: ', productId);
    // res.redirect('/cart');
}

const getOrders = (req, res, next) => {
    Order.find({
        'user.userId': req.user._id
    })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders
            });
        })
        .catch(err => console.log('cannot get orders: ', err));

    // req.user.getOrders({
    //     include: ['products']
    // })
    //     .then(orders => {
    //         res.render('shop/orders', {
    //             pageTitle: 'Your Orders',
    //             path: '/orders',
    //             orders
    //         })
    //     })
    //     .catch(err => console.log('cannot get orders: ', err));
}

const postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId', 'title price imageUrl description')
        .then(user => {
            const cartProducts = user.cart.items.map(item => {
                return {
                    product: {
                        // all related data from product
                        ...item.productId._doc
                    },
                    quantity: item.quantity
                }
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: cartProducts
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log('cannot add order: ', err));

    // let fetchedCart;
    // req.user.getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts()
    //     })
    //     .then(products => {
    //         return req.user
    //             .createOrder()
    //             .then(order => {
    //                 return order.addProducts(products.map(product => {
    //                     product.orderItem = {
    //                         quantity: product.cartItem.quantity
    //                     }
    //                     return product;
    //                 }));
    //             })
    //             .catch(err => console.log('add product err: ', err));
    //     })
    //     .then(result => {
    //         return fetchedCart.setProducts(null);
    //     })
    //     .then(cartItems => {
    //         res.redirect('/orders');
    //     })
    //     .catch(err => {
    //         console.log('postOrder err: ', err);
    //     });
}

const postCartDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    req.user.removeFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log('cannot delete product: ', err));
    // sequelize
    // req.user.getCart()
    //     .then(cart => {
    //         return cart.getProducts({
    //             where: {
    //                 id: productId
    //             }
    //         })
    //     })
    //     .then(products => {
    //         const product = products[0];
    //         return product.cartItem.destroy();
    //     })
    //     .then(result => {
    //         res.redirect('/cart');
    //     });
}


module.exports = {
    getProducts,
    getProduct,
    getIndex,
    getCart,
    postCart,
    getOrders,
    postOrder,
    postCartDeleteProduct
}