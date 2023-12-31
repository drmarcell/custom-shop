const Product = require("../models/product");
const { validationResult } = require('express-validator');
const fileHelper = require('../utils/file');

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        isEditing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
};

const postAddProduct = (req, res, next) => {
    console.log('POSTADDPRODUCT CALLED');
    const { title, price, description } = req.body;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            isEditing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        });
    }
    const errors = validationResult(req);
    console.log('errors are: ', errors);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            isEditing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        title,
        price,
        imageUrl,
        description,
        userId: req.user
    });
    product.save()
        .then(result => {
            console.log('Created product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('product save failed: ', err);
        })

    // sequelize
    // associated object with createXYZ
    // req.user
    //     .createProduct({
    //         title,
    //         price,
    //         imageUrl,
    //         description
    //     })
    //     .then(result => {
    //         console.log('Created Product');
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log('create product with association');
    //     })

    // Product.create({
    //     title,
    //     price,
    //     imageUrl,
    //     description
    // }).then(() => {
    //     console.log('product successfully added');
    //     res.redirect('/products');
    // })
    // .catch(err => {
    //     console.log('an error occured when adding the product: ', err);
    // })

    // const product = new Product(null, title, imageUrl, price, description);
    // product.save()
    //   .then(() => {
    //     res.redirect('/products');
    //   })
    //   .catch(() => {});
};

const getEditProduct = (req, res, next) => {
    const editMode = Boolean(req.query.edit);
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    console.log('productId is: ', productId)
    Product.findById(productId)
        .then(product => {
            res.render('admin/edit-product', {
                product,
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                isEditing: editMode,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            })
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    // sequelize magic associated function
    // req.user
    //     .getProducts({
    //         where: {
    //             id: productId
    //         }
    //     })
    //     // old approach
    //     // Product.findByPk(productId)
    //     .then(products => {
    //         res.render('admin/edit-product', {
    //             product: products[0],
    //             pageTitle: 'Edit Product',
    //             path: '/admin/edit-product',
    //             isEditing: editMode
    //         });
    //     })
    //     .catch(err => {
    //         console.log('cannot edit the product: ', err);
    //     })
    // Product.getProductById(productId, product => {
    //     if (!product) {
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product', {
    //         product,
    //         pageTitle: 'Edit Product',
    //         path: '/admin/edit-product',
    //         isEditing: editMode
    //     })
    // })
};

const postEditProduct = (req, res, next) => {
    const { productId, title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            isEditing: true,
            hasError: true,
            product: {
                _id: productId,
                title,
                price,
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(productId)
        .then(product => {
            if (String(product.userId) !== String(req.user._id)) {
                return res.redirect('/');
            }
            product.title = title;
            product.price = price;
            if (image) {
                fileHelper.deleteFile(image.imageUrl);
                product.imageUrl = image.path;
            }
            product.description = description;
            return product.save()
                .then(result => {
                    res.redirect('/admin/products');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    // Product.update({
    //     title,
    //     price,
    //     imageUrl,
    //     description
    // }, {
    //     where: {
    //         id: productId
    //     }
    // })
    //     .then(modifiedProduct => {
    //         console.log('modified product is: ', modifiedProduct)
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log('cannot modify the product data: ', err);
    //     });
    // const product = new Product(productId, title, imageUrl, price, description);
    // product.save();
}

const getProducts = (req, res, next) => {
    Product.find({
        userId: req.user._id
    })
        // .select('title price -_id')
        // .populate('userId', 'name email')
        .then(products => {
            console.log('getProducts products: ', products);
            res.render('admin/products', {
                products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

    // // sequelize magic associate mehotd
    // req.user
    //     .getProducts()
    // // old method
    // // Product.findAll()
    //     .then(products => {
    //         res.render('admin/products', {
    //             products,
    //             pageTitle: 'Admin Products',
    //             path: '/admin/products'
    //         })
    //     })
    //     .catch(err => {

    //     });
    // Product.fetchAllProduct(products => {
    //     res.render('admin/products', {
    //         products,
    //         pageTitle: 'Admin Products',
    //         path: '/admin/products'
    //     });
    // });
};

const deleteProduct = (req, res, next) => {
    const { productId } = req.params;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({
                _id: productId,
                userId: req.user._id
            });
        })
        .then(() => {
            res.status(200).json({
                message: 'Success!'
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Deleting product failed.'
            });
        });
    // Product.destroy({
    //     where: {
    //         id: productId
    //     }
    // })
    //     .then(() => {
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log('cannot delete product: ', err);
    //     })
    // Product.deleteById(productId);
};

module.exports = {
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    getProducts,
    deleteProduct
}