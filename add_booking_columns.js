import pg from 'pg';
const pool = new pg.Pool({
  user: 'postgres',
  password: '1234',
  database: 'organizer_db',
  host: 'localhost',
  port: 5432
});

const query = `
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_type VARCHAR(50) DEFAULT 'OFFLINE';
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(100);
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT;
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_status VARCHAR(50);
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_meeting_needed BOOLEAN DEFAULT FALSE;
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_meeting_type VARCHAR(50) DEFAULT 'OFFLINE';
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_meeting_time TIMESTAMPTZ;
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_meeting_link TEXT;
`;

pool.query(query)
  .then(() => console.log('Columns added to bookings table.'))
  .catch(console.error)
  .finally(() => pool.end());
