// sequelize
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;

// simple mySQL2
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     database: process.env.DB,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS
// });

// module.exports = pool.promise();

