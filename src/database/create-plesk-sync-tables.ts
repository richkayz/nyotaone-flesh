import { db } from './db.js';

async function createPleskSyncTables() {
  let connection;

  try {
    connection = await db.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS plesk_domains (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        plesk_domain_id BIGINT UNSIGNED NULL,
        domain_name VARCHAR(253) NOT NULL UNIQUE,
        status VARCHAR(50) NULL,
        hosting_type VARCHAR(50) NULL,
        account_id BIGINT UNSIGNED NULL,
        sync_status ENUM('pending', 'synced', 'error')
          NOT NULL DEFAULT 'pending',
        last_synced_at TIMESTAMP NULL,
        sync_error TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        UNIQUE KEY unique_plesk_domain_id (plesk_domain_id),

        CONSTRAINT fk_plesk_domains_account
          FOREIGN KEY (account_id)
          REFERENCES accounts(id)
          ON DELETE SET NULL
      )
    `);

    console.log('Plesk domain sync table created successfully.');
  } catch (error) {
    console.error('Failed to create Plesk sync table:', error);
    process.exitCode = 1;
  } finally {
    connection?.release();
    await db.end();
  }
}

createPleskSyncTables();