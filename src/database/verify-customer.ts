
import { db } from './db.js';

async function verifyCustomer() {
  let connection;

  try {
    connection = await db.getConnection();

    const columns = await connection.query(
      'DESCRIBE users'
    );

    console.log('\nActual users table structure:');
    console.table(columns);

    const rows = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['testcustomer@nyotaone.com']
    );

    console.log('\nCustomer search result:');

    if (rows.length > 0) {
      console.table(rows);
      console.log('Customer exists in database.');
    } else {
      console.log('Customer NOT found in database.');
    }
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    connection?.release();
    await db.end();
  }
}

verifyCustomer();
