const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require("../models/product");
const Cart = require('../models/cart');
const Order = require('../models/order');
const { ITEMS_PER_PAGE } = require('../utils/common');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', {
                products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

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

const getCheckoutSuccess = (req, res, next) => {
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

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

const getCheckout = (req, res, next) => {
    let products;
    let total;
    req.user
        .populate('cart.items.productId')
        .then(user => {
            console.log('getCheckout called');
            products = user.cart.items;
            total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price;
            });

            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                              name: p.productId.title,
                              description: p.productId.description
                            },
                            unit_amount: p.productId.price * 100,
                          },
                          quantity: p.quantity,
                    }
                }),
                mode: 'payment',
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
              });
        })
        .then(stripeSession => {
            console.log('stripe session is: ', stripeSession);
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products,
                totalSum: total,
                sessionId: stripeSession.id
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const getInvoice = (req, res, next) => {
    const { orderId } = req.params;
    console.log('getInvoice called, orderId: ', orderId);
    Order
        .findById(orderId)
        .then(order => {
            if (!order) {
                return next('No order found');
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next('Unauthorized!');
            }
            console.log('then block continues')
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            console.log('invoice path is: ', invoicePath);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('------------------------');
            let totalPrice = 0;
            order.products.forEach(fullProductInfo => {
                totalPrice += fullProductInfo.quantity * fullProductInfo.product.price;
                pdfDoc.fontSize(14).text(`${fullProductInfo.product.title} - ${fullProductInfo.quantity} x $${fullProductInfo.product.price}`);
            });
            pdfDoc.text('------------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
            pdfDoc.end();

            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     console.log('invoice data:', data)
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            //     res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);
            // file.pipe(res);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


module.exports = {
    getProducts,
    getProduct,
    getIndex,
    getCart,
    postCart,
    getOrders,
    postCartDeleteProduct,
    getInvoice,
    getCheckout,
    getCheckoutSuccess
}