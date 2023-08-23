const path = require('path');
const fs = require('fs');
const { rootDir } = require('../utils/paths');
const filePath = path.join(rootDir, 'data', 'products.json');
const Cart = require('./cart');

const getProductsFromFile = callbackFn => {
    fs.readFile(filePath, (err, fileContent) => {
        if (err) {
            callbackFn([]);
        } else {
            callbackFn(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
                    if (err) {
                        console.log('error when writing the file: ', err);
                    }
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(filePath, JSON.stringify(products), (err) => {
                    if (err) {
                        console.log('error when writing the file: ', err);
                    }
                });
            } 
        });

    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id);
            const updatedProducts = products.filter(product => product.id !== id);
            fs.writeFile(filePath, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            })
        });
    }

    static fetchAllProduct(callbackFn) {
        getProductsFromFile(callbackFn);
    }

    static getProductById(id, callbackFn) {
        getProductsFromFile(products => {
            const chosenProduct = products.find(product => product.id === id);
            chosenProduct ? callbackFn(chosenProduct) : callbackFn(null);
        });
    }
}