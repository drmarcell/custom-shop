// const http = require('http');
// const app = require('./app');
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./utils/database');
app.use(cors());

// set templating engine (built-in) - ejs
app.set('view engine', 'ejs');
// route for templating engine 'views' is the default -> https://expressjs.com/en/4x/api.html#app.set
app.set('views', 'views');
const { rootDir } = require('./utils/paths');
app.use(express.static(path.join(rootDir, 'public')))
app.use(express.urlencoded({ extended: true }));
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

// sequelize
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const PORT = 8000;

// const server = http.createServer(app);

// server.listen(PORT, () => {
//     console.log('server listening on port: ', PORT);
// });

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log('cannot get user: ', err);
        })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use((req, res, next) => {
//     // res.status(404).sendFile(path.join(rootDir, 'views', 'page404.html'));
// });

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
// it is the same as above
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// TODO: DELETE force: true in production
sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Marci',
                email: 'test@test.com'
            });
        }
        return user;
    })
    .then(user => {
        user.createCart();
    })
    .then(cart => {
        app.listen(PORT, () => {
            console.log('server listening on: ', PORT);
        });
    })
    .catch(err => {
        console.log('error when trying to sync the database: ', err);
    });


