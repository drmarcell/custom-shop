const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

module.exports = pool.promise();