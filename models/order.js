const { Schema, model } = require('mongoose');
const { MONGOOSE_USER, MONGOOSE_ORDER } = require('../utils/common');

const orderSchema = new Schema({
    products: [
        {
            product: {
                type: Object,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: MONGOOSE_USER
        }
    }
});

module.exports = model(MONGOOSE_ORDER, orderSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     }
// });

// module.exports = Order;
