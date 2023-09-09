const { Schema, model } = require('mongoose');
const { MONGOOSE_PRODUCT, MONGOOSE_USER } = require('../utils/common');
const Product = require('../models/product');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: MONGOOSE_PRODUCT,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return String(cp.productId) === String(product._id);
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => String(item.productId) !== String(productId));
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = {
        items: []
    };
    return this.save();
}

module.exports = model(MONGOOSE_USER, userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../utils/database').getDb;

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart; // {items: []}
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return String(cp.productId) === String(product._id);
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new mongodb.ObjectId(product._id),
//                 quantity: newQuantity
//             })
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         return db.collection('users').updateOne({
//             _id: new mongodb.ObjectId(this._id)
//         }, {
//             $set: {
//                 cart: updatedCart
//             }
//         })
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => String(item.productId) !== String(productId));
//         const updatedCart = {
//             items: updatedCartItems
//         }
//         const db = getDb();
//         return db.collection('users').updateOne({
//             _id: new mongodb.ObjectId(this._id)
//         }, {
//             $set: {
//                 cart: updatedCart
//             }
//         })
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         })
//         return db.collection('products').find({
//             _id: {
//                 $in: productIds
//             }
//         })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(item => {
//                             return item.productId.toString() === product._id.toString();
//                         }).quantity
//                     };
//                 });
//             })
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     name: this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order);
//         })
//         .then(() => {
//             this.cart = { items: [] };
//             return db.collection('users')
//                 .updateOne({
//                     _id: new mongodb.ObjectId(this._id)
//                 }, {
//                     $set: {
//                         cart: {
//                             items: []
//                         }
//                     }
//                 })
//         });
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({
//             'user._id': new mongodb.ObjectId(this._id)
//         })
//         .toArray();
//     }

//     static getUserById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({
//             _id: new mongodb.ObjectId(userId)
//         })
//     }


// }

// module.exports = User;

// // const Sequelize = require('sequelize');
// // const sequelize = require('../utils/database');

// // const User = sequelize.define('user', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     name: Sequelize.STRING,
// //     email: Sequelize.STRING
// // });

// // module.exports = User;