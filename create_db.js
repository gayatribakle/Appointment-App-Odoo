import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default db first
});

async function createDb() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    // Check if db exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = 'organizer_db'`);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE organizer_db`);
      console.log("Database organizer_db created successfully!");
    } else {
      console.log("Database organizer_db already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await client.end();
  }
}

createDb();
