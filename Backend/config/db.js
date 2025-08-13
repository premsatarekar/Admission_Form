import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'vizionexl_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
  queueLimit: 0,
});

const db = pool.promise();

// Test connection at startup
(async () => {
  try {
    const conn = await db.getConnection();
    console.log(
      `✅ Connected to MySQL database: ${process.env.DB_NAME || 'vizionexl_db'}`
    );
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage || 'N/A',
    });
  }
})();

// Pool error handling
pool.on('error', (err) => {
  console.error('MySQL pool error:', {
    message: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage || 'N/A',
  });
});

export default db;
