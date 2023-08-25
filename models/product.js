const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Product;

// with class
// const path = require('path');
// const fs = require('fs');
// const { rootDir } = require('../utils/paths');
// const filePath = path.join(rootDir, 'data', 'products.json');
// const Cart = require('./cart');
// const db = require('../utils/database');

// module.exports = class Product {
//     constructor(id, title, imageUrl, price, description) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save() {
//         return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
//             this.title,
//             this.price,
//             this.imageUrl,
//             this.description
//         ]);
//     }

//     static deleteById(id) {
        
//     }

//     static fetchAllProduct() {
//         return db.execute('SELECT * FROM products');
//     }

//     static getProductById(id) {
//         return db.execute('SELECT * FROM products WHERE id = ?', [id])
//     }
// }