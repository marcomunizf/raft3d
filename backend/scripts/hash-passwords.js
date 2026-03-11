/**
 * One-time script to migrate plain-text passwords to bcrypt hashes.
 * Run after migration 005:
 *   npm run hash-passwords
 *
 * Safe to run multiple times — already-hashed passwords (starting with $2b$) are skipped.
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const SALT_ROUNDS = 12;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { rows: users } = await pool.query(
      'SELECT id, email, password_hash FROM users'
    );

    console.log(`Found ${users.length} user(s) to process.`);

    for (const user of users) {
      if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        console.log(`  [skip] ${user.email} — already hashed`);
        continue;
      }

      const hash = await bcrypt.hash(user.password_hash, SALT_ROUNDS);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user.id]);
      console.log(`  [ok]   ${user.email} — password hashed`);
    }

    console.log('Done.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
