
import { db } from './db.js';

async function inspectTables() {
  let connection;

  try {
    connection = await db.getConnection();

    // List all existing database tables
    const tables = await connection.query(
      'SHOW TABLES'
    );

    console.log('\n=== ALL DATABASE TABLES ===');
    console.table(tables);

    // Inspect authentication and customer relationship
    for (const table of ['users', 'accounts', 'customer_profiles']) {
      try {
        const columns = await connection.query(
          `DESCRIBE ${table}`
        );

        console.log(`\n=== ${table} ===`);
        console.table(columns);
      } catch (error) {
        console.log(`Could not inspect ${table}:`, error);
      }
    }

    // Find tables potentially related to domains, mailboxes, and Plesk
    const relatedTables = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND (
        TABLE_NAME LIKE '%domain%'
        OR TABLE_NAME LIKE '%mail%'
        OR TABLE_NAME LIKE '%email%'
        OR TABLE_NAME LIKE '%plesk%'
        OR TABLE_NAME LIKE '%hosting%'
      )
    `);

    console.log('\n=== DOMAIN, EMAIL AND PLESK TABLES ===');
    console.table(relatedTables);

  } catch (error) {
    console.error('Database inspection failed:', error);
  } finally {
    connection?.release();
    await db.end();
  }
}

inspectTables();
