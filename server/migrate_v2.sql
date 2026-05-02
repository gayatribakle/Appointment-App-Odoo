-- Add providers table
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link providers to services (via a junction table or direct if 1:1, but many:many is better)
CREATE TABLE IF NOT EXISTS service_providers (
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, provider_id)
);

-- Update slots to include provider_id
ALTER TABLE slots ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE;

-- Update bookings to include reference code if missing (was in controller but not in init.sql schema)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference_code VARCHAR(20) UNIQUE;

-- Add a status to services for admin approval if missing
ALTER TABLE services ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update users to include role check
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
