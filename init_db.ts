import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function init() {
  try {
    const initSql = fs.readFileSync(path.join(process.cwd(), 'server', 'init.sql'), 'utf8');
    await pool.query(initSql);
    console.log('✅ init.sql executed successfully');
    
    // Check if other migrations need to be run
    if (fs.existsSync(path.join(process.cwd(), 'server', 'migrate.sql'))) {
      const migrateSql = fs.readFileSync(path.join(process.cwd(), 'server', 'migrate.sql'), 'utf8');
      await pool.query(migrateSql);
      console.log('✅ migrate.sql executed successfully');
    }

    if (fs.existsSync(path.join(process.cwd(), 'server', 'migrate_v2.sql'))) {
      const migrateV2Sql = fs.readFileSync(path.join(process.cwd(), 'server', 'migrate_v2.sql'), 'utf8');
      await pool.query(migrateV2Sql);
      console.log('✅ migrate_v2.sql executed successfully');
    }

  } catch (err) {
    console.error('❌ DB Init failed:', err);
  } finally {
    await pool.end();
  }
}

init();
