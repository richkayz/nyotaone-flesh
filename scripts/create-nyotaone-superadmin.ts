import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { db } from '../src/database/db.js';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (key: string) => {
      if (key === '\u0003') {
        stdout.write('\nCancelled.\n');
        stdin.setRawMode?.(false);
        stdin.pause();
        process.exit(1);
      }

      if (key === '\r' || key === '\n') {
        stdout.write('\n');
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        resolve(password);
        return;
      }

      if (key === '\u007f' || key === '\b') {
        password = password.slice(0, -1);
        return;
      }

      if (key >= ' ') {
        password += key;
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  console.log('\nCreate NyotaOne Superadmin\n');

  const fullName = (await ask('Full name [NyotaOne Superadmin]: ')) || 'NyotaOne Superadmin';
  const username = (await ask('Username [nyotaadmin]: ')).toLowerCase() || 'nyotaadmin';
  const email = (await ask('Admin email address: ')).toLowerCase();
  const password = await askHidden('Password (hidden): ');
  const confirmPassword = await askHidden('Confirm password (hidden): ');

  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (username.length < 3) {
    throw new Error('Username must contain at least 3 characters.');
  }

  if (password.length < 12) {
    throw new Error('Use a password with at least 12 characters.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  let connection;

  try {
    connection = await db.getConnection();

    const existing = await connection.query(
      'SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
      [username, email]
    );

    if (existing.length > 0) {
      throw new Error('That username or email already exists. No user was created.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();

    await connection.query(
      `INSERT INTO users
        (id, full_name, username, email, phone, password_hash, role, is_active, account_id)
       VALUES (?, ?, ?, ?, '', ?, 'superadmin', 1, NULL)`,
      [id, fullName, username, email, passwordHash]
    );

    console.log('\nSuperadmin created successfully.');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log('Role: superadmin');
    console.log('Account ID: none');
    console.log('\nKeep your password safe. It was not printed or saved by this script.');
  } finally {
    connection?.release();
    await db.end();
  }
}

main().catch((error) => {
  console.error('\nSuperadmin creation failed:', error.message || error);
  process.exitCode = 1;
});
