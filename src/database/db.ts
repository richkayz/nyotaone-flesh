import 'dotenv/config';
import mariadb from 'mariadb';

export const db = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3307),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 5,
  acquireTimeout: 10000,
  charset: 'utf8mb4',
});

export async function testDatabaseConnection() {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.query('SELECT 1');
    return true;
  } finally {
    connection?.release();
  }
}