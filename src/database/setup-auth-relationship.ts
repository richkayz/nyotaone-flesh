
import { db } from './db.js';

async function setupAuthRelationship() {
  let connection;

  try {
    connection = await db.getConnection();

    await connection.query(`
      ALTER TABLE users
      ADD COLUMN account_id BIGINT UNSIGNED NULL
    `);

    await connection.query(`
      ALTER TABLE users
      ADD INDEX idx_users_account_id (account_id)
    `);

    await connection.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_account
      FOREIGN KEY (account_id)
      REFERENCES accounts(id)
      ON DELETE RESTRICT
    `);

    console.log('User-account relationship created successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection?.release();
    await db.end();
  }
}

setupAuthRelationship();
