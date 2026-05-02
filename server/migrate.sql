-- ============================================================
-- Migration: Extend to 3-Role System
-- Run: psql -U postgres -d organizer_db -f server/migrate.sql
-- ============================================================

-- 1. Add status column to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
  CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Mark existing published services as ACTIVE
UPDATE services SET status = 'ACTIVE' WHERE is_published = TRUE;

-- 2. Add is_active to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Ensure all 3 roles exist
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('organizer') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

-- 4. Add unique constraint on bookings to prevent double booking
-- (service_id + slot_id combination already has unique slot constraint, but enforce at booking level)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference_code VARCHAR(20) UNIQUE;

-- 5. Index for status-based service queries
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- 6. Index for admin booking queries  
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

SELECT 'Migration completed successfully.' as result;
