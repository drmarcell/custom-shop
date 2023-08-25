const Product = require("../models/product");

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        isEditing: false
    })
};

const postAddProduct = (req, res, next) => {
    const { title, price, imageUrl, description } = req.body;

    // associated object with createXYZ
    req.user
        .createProduct({
            title,
            price,
            imageUrl,
            description
        })
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('create product with association');
        })

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
    // magic associated function
    req.user
        .getProducts({
            where: {
                id: productId
            }
        })
        // old approach
        // Product.findByPk(productId)
        .then(products => {
            res.render('admin/edit-product', {
                product: products[0],
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                isEditing: editMode
            });
        })
        .catch(err => {
            console.log('cannot edit the product: ', err);
        })
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
    const { productId, title, price, imageUrl, description } = req.body;
    Product.update({
        title,
        price,
        imageUrl,
        description
    }, {
        where: {
            id: productId
        }
    })
        .then(modifiedProduct => {
            console.log('modified product is: ', modifiedProduct)
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('cannot modify the product data: ', err);
        });
    // const product = new Product(productId, title, imageUrl, price, description);
    // product.save();
}

const getProducts = (req, res, next) => {
    // magic associate mehotd
    req.user
        .getProducts()
    // old method
    // Product.findAll()
        .then(products => {
            res.render('admin/products', {
                products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => {

        });
    // Product.fetchAllProduct(products => {
    //     res.render('admin/products', {
    //         products,
    //         pageTitle: 'Admin Products',
    //         path: '/admin/products'
    //     });
    // });
};

const postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.destroy({
        where: {
            id: productId
        }
    })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('cannot delete product: ', err);
        })
    // Product.deleteById(productId);
};

module.exports = {
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    getProducts,
    postDeleteProduct
}