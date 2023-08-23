// const http = require('http');
// const app = require('./app');
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
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

const PORT = 8000;

// const server = http.createServer(app);

// server.listen(PORT, () => {
//     console.log('server listening on port: ', PORT);
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use((req, res, next) => {
//     // res.status(404).sendFile(path.join(rootDir, 'views', 'page404.html'));
// });

app.use(errorController.get404);

app.listen(PORT, () => {
    console.log('server listening on: ', PORT);
});

