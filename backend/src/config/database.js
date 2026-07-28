// config db.js //

require('dotenv').config(); // load .env
const mysql = require('mysql2/promise');

// parse database URL
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) {
    throw new Error('DATABASE_URL belum di set di env');
}
const url = new URL(dbUrl); // Node URL class

const pool = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''),
    port: url.port ? Number(url.port) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
