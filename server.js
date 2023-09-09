// const http = require('http');
// const app = require('./app');
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const PORT = process.env.PORT || 8000;

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
// mongo
// const mongoConnect = require('./utils/database').mongoConnect;
const User = require('./models/user');

const app = express();
const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
});
// sequelize
// const sequelize = require('./utils/database');
app.use(cors());
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// set templating engine (built-in) - ejs
app.set('view engine', 'ejs');
// route for templating engine 'views' is the default -> https://expressjs.com/en/4x/api.html#app.set
app.set('views', 'views');
const { rootDir } = require('./utils/paths');
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn,
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            console.log('cannot find user session: ', err);
            next(new Error(err));
        });
});

// sequelize
// const User = require('./models/user');
// const Product = require('./models/product');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

// const server = http.createServer(app);

// server.listen(PORT, () => {
//     console.log('server listening on port: ', PORT);
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.get('/500', errorController.get500);

app.use((error, req, res, next) => {
    res.status(500).render('page500', {
        pageTitle: 'Error!',
        path: '/500',
        isLoggedIn: req.session.isLoggedIn
      });
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log('server listening on: ', PORT);
        });
    })
    .catch(err => {
        console.log('connection failed: ', err);
    })

// app.use((req, res, next) => {
//     // res.status(404).sendFile(path.join(rootDir, 'views', 'page404.html'));
// });

// mongoConnect(() => {
//     app.listen(PORT, () => {
//         console.log('server listening on: ', PORT);
//     });
// });

// sequelize
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// User.hasMany(Product);
// User.hasOne(Cart);
// // it is the same as above
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });

// // TODO: DELETE force: true in production
// sequelize
//     // .sync({ force: true })
//     .sync()
//     .then(result => {
//         return User.findByPk(1);
//     })
//     .then(user => {
//         if (!user) {
//             return User.create({
//                 name: 'Marci',
//                 email: 'test@test.com'
//             });
//         }
//         return user;
//     })
//     .then(user => {
//         user.createCart();
//     })
//     .then(cart => {
//         app.listen(PORT, () => {
//             console.log('server listening on: ', PORT);
//         });
//     })
//     .catch(err => {
//         console.log('error when trying to sync the database: ', err);
//     });


