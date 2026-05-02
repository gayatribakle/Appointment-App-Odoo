import pg from 'pg';
const pool = new pg.Pool({
  user: 'postgres',
  password: '1234',
  database: 'organizer_db',
  host: 'localhost',
  port: 5432
});

const query = `
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(100);
`;

pool.query(query)
  .then(() => console.log('gateway_order_id added to payments table.'))
  .catch(console.error)
  .finally(() => pool.end());
