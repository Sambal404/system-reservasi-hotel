import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validasi isi dari .env
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const env of requiredEnv) {
    if (!process.env[env]) {
        console.error(`[FATAL ERROR]: Variabel .env untuk '${env}' wajib diisi!`);
        process.exit(1); // Matikan aplikasi sebelum server jalan
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;