/**
 * Admin Seed Script
 * Run once: npx tsx server/seed.ts
 * Creates the default admin account defined in .env
 */
import bcrypt from 'bcrypt';
import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'admin@booksync.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const name = 'System Admin';

  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length > 0) {
    console.log(`✅ Admin user already exists: ${email}`);
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const roleRes = await pool.query("SELECT id FROM roles WHERE name='admin'");
  if (!roleRes.rows.length) {
    console.error('❌ Admin role not found. Run init.sql and migrate.sql first.');
    await pool.end();
    return;
  }

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id, is_verified, is_active)
     VALUES ($1,$2,$3,$4,TRUE,TRUE)`,
    [name, email, hash, roleRes.rows[0].id]
  );

  console.log(`✅ Admin created successfully!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  await pool.end();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
