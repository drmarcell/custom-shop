// mongodb
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callbackFn => {
    console.log('trying to connect mongodb...');
    MongoClient.connect(process.env.MONGO_URL)
        .then(client => {
            _db = client.db();
            callbackFn();
        })
        .catch(err => {
            console.log('Database connection failed', err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
}

module.exports = {
    mongoConnect,
    getDb
}

// sequelize
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
//     host: 'localhost',
//     dialect: 'mysql'
// });

// module.exports = sequelize;

// simple mySQL2
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     database: process.env.DB,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS
// });

// module.exports = pool.promise();

