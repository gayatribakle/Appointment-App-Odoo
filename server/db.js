import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL, -- 'One-to-One', 'Group', 'Resource-based'
    status TEXT NOT NULL DEFAULT 'active',
    buffer_before INTEGER DEFAULT 15,
    buffer_after INTEGER DEFAULT 15,
    advance_booking_limit INTEGER DEFAULT 30,
    cancellation_deadline INTEGER DEFAULT 24
  );

  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Provider', 'Resource'
    status TEXT NOT NULL DEFAULT 'available',
    hours_per_week INTEGER DEFAULT 40
  );

  CREATE TABLE IF NOT EXISTS provider_services (
    provider_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    PRIMARY KEY (provider_id, service_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Singleton
    working_days TEXT NOT NULL, -- JSON array like '[true, true, ...]'
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_interval INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    start_time TEXT NOT NULL, -- HH:mm
    end_time TEXT NOT NULL, -- HH:mm
    provider_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'partial', 'full', 'blocked'
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    service_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'pending', 'cancelled'
    date TEXT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
  );
`);

// Check if schedule is empty, if so, seed it
const scheduleCount = db.prepare('SELECT COUNT(*) as count FROM schedule').get();
if (scheduleCount.count === 0) {
  db.prepare(`
    INSERT INTO schedule (id, working_days, start_time, end_time, slot_interval)
    VALUES (1, ?, '09:00', '17:00', 60)
  `).run(JSON.stringify([true, true, true, true, true, false, false]));
}

// Check if providers is empty, seed mock data
const providersCount = db.prepare('SELECT COUNT(*) as count FROM providers').get();
if (providersCount.count === 0) {
  const insertProvider = db.prepare('INSERT INTO providers (name, type, status, hours_per_week) VALUES (?, ?, ?, ?)');
  insertProvider.run('Dr. Sarah Smith', 'Provider', 'available', 40);
  insertProvider.run('Dr. Michael Johnson', 'Provider', 'available', 35);
  insertProvider.run('Team A', 'Provider', 'available', 30);
  insertProvider.run('Room B', 'Resource', 'available', 45);

  const insertService = db.prepare('INSERT INTO services (name, description, duration, capacity, type, status) VALUES (?, ?, ?, ?, ?, ?)');
  const s1 = insertService.run('Consultation', 'One-on-one client consultation', 60, 1, 'One-to-One', 'active').lastInsertRowid;
  const s2 = insertService.run('Group Session', 'Group therapy session', 90, 8, 'Group', 'active').lastInsertRowid;
  const s3 = insertService.run('Workshop', 'Educational workshop', 120, 20, 'Group', 'active').lastInsertRowid;
  
  const insertProviderService = db.prepare('INSERT INTO provider_services (provider_id, service_id) VALUES (?, ?)');
  insertProviderService.run(1, s1);
  insertProviderService.run(1, s3);
  insertProviderService.run(2, s1);
  insertProviderService.run(3, s2);
  insertProviderService.run(4, s3);
}

export default db;
