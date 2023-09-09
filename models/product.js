const mongoose = require('mongoose');
const { MONGOOSE_USER, MONGOOSE_PRODUCT } = require('../utils/common');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: MONGOOSE_USER
    }
});

module.exports = mongoose.model(MONGOOSE_PRODUCT, productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../utils/database').getDb;

// class Product {
//     constructor(title, price, imageUrl, description, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             dbOp = db.collection('products').updateOne({
//                 _id: this._id
//             }, {
//                 $set: this
//             })
//         } else {
//             console.log('dont have id');
//             dbOp = db.collection('products').insertOne(this);
//         }
//         return dbOp
//             .then(result => {
//                 console.log('dbOp result: ', result);
//             })
//             .catch(err => {
//                 console.log('dbOp failed: ', err);
//             })
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log('fetched products all: ', products);
//                 return products;
//             })
//             .catch(err => {
//                 console.log('fetched products err: ', err);
//             })
//     }
    
//     static fetchProduct(productId) {
//         const db = getDb();
//         return db.collection('products')
//             .findOne({
//                 _id: new mongodb.ObjectId(productId)
//             })
//             .then(product => product)
//             .catch(err => console.log('cannot get single product: ', err));
//     }

//     static getProductById(productId) {
//         const db = getDb();
//         return db.collection('products')
//             .findOne({
//                 _id: new mongodb.ObjectId(productId)
//             })
//             .then(product => product)
//             .catch(err => console.error('cannot get product: ', err));
//     }

//     static deleteProductById(productId) {
//         const db = getDb();
//         return db.collection('products')
//             .deleteOne({
//                 _id: new mongodb.ObjectId(productId)
//             })
//             .then(result => {
//                 console.log('Deleted')
//             })
//             .catch(err => console.log('product cannot deleted: ', err));
//     }
// }

// module.exports = Product;

// // const Sequelize = require('sequelize');
// // const sequelize = require('../utils/database');

// // const Product = sequelize.define('product', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     title: Sequelize.STRING,
// //     price: {
// //         type: Sequelize.DOUBLE,
// //         allowNull: false
// //     },
// //     imageUrl: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     description: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     }
// // });

// // module.exports = Product;

// // with class
// // const path = require('path');
// // const fs = require('fs');
// // const { rootDir } = require('../utils/paths');
// // const filePath = path.join(rootDir, 'data', 'products.json');
// // const Cart = require('./cart');
// // const db = require('../utils/database');

// // module.exports = class Product {
// //     constructor(id, title, imageUrl, price, description) {
// //         this.id = id;
// //         this.title = title;
// //         this.imageUrl = imageUrl;
// //         this.price = price;
// //         this.description = description;
// //     }

// //     save() {
// //         return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
// //             this.title,
// //             this.price,
// //             this.imageUrl,
// //             this.description
// //         ]);
// //     }

// //     static deleteById(id) {
        
// //     }

// //     static fetchAllProduct() {
// //         return db.execute('SELECT * FROM products');
// //     }

// //     static getProductById(id) {
// //         return db.execute('SELECT * FROM products WHERE id = ?', [id])
// //     }
// // }