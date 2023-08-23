const fs = require('fs');
const path = require('path');
const { rootDir } = require('../utils/paths');

const filePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(filePath, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {
                    id,
                    qty: 1
                }
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + Number(productPrice);

            fs.writeFile(filePath, JSON.stringify(cart), err => {
                console.log('cannot write cart to file: ', err);
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(filePath, (err, fileContent) => {
            if (err) {
                return;
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.findIndex(prod => prod.id === id);
            if (!product) {
                return;
            }
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            fs.writeFile(filePath, JSON.stringify(updatedCart), err => {
                console.log('cannot write cart to file: ', err);
            })
        });
    }

    static getCart(callbackFn) {
        fs.readFile(filePath, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                callbackFn(null);
            } else {
                callbackFn(cart);
            }
        })
    }
}