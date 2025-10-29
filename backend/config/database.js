import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Debug: print DB_USER to verify .env loading
console.log('DB_USER:', process.env.DB_USER);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

export default promisePool;
