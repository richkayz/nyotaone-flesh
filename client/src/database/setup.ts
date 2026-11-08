
import { db } from './db.js';

async function setupDatabase() {
  let connection;

  try {
    connection = await db.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        account_name VARCHAR(150) NOT NULL,
        account_type ENUM('individual', 'business') NOT NULL DEFAULT 'business',
        status ENUM('active', 'suspended', 'closed') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NULL,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM(
          'superadmin',
          'client_admin',
          'support_agent',
          'finance_agent',
          'mailbox_user'
        ) NOT NULL DEFAULT 'client_admin',
        status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_users_account
          FOREIGN KEY (account_id)
          REFERENCES accounts(id)
          ON DELETE RESTRICT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL UNIQUE,
        company_name VARCHAR(200) NOT NULL,
        logo_url VARCHAR(500) NULL,
        brand_color VARCHAR(20) DEFAULT '#263A70',
        accent_color VARCHAR(20) DEFAULT '#6478E8',
        support_email VARCHAR(255) NULL,
        support_phone VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_profiles_account
          FOREIGN KEY (account_id)
          REFERENCES accounts(id)
          ON DELETE CASCADE
      )
    `);

    console.log('NyotaOne customer database foundation created.');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exitCode = 1;
  } finally {
    connection?.release();
    await db.end();
  }
}

setupDatabase();
