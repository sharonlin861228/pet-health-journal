-- Pet Health Journal Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PETS table
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  breed TEXT,
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HEALTH RECORDS table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('vaccine', 'checkup', 'medication', 'weight')),
  label TEXT,
  value TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEHAVIOR LOGS table
CREATE TABLE behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REMINDERS table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  type TEXT, -- e.g. 'vaccine', 'medication', 'custom'
  repeat_interval TEXT, -- e.g. 'daily', 'weekly', 'monthly', null
  due_date TIMESTAMPTZ NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIGGER: update updated_at on row change
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_behavior_logs_updated_at
  BEFORE UPDATE ON behavior_logs
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- PETS policies
CREATE POLICY "Users can access their pets" ON pets
  FOR ALL USING (user_id = auth.uid());

-- HEALTH RECORDS policies
CREATE POLICY "Users can access health records of their pets" ON health_records
  FOR ALL USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- BEHAVIOR LOGS policies
CREATE POLICY "Users can access behavior logs of their pets" ON behavior_logs
  FOR ALL USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- REMINDERS policies
CREATE POLICY "Users can access their reminders" ON reminders
  FOR ALL USING (user_id = auth.uid());

-- SAMPLE DATA (Optional - for testing)
-- Replace 'YOUR_USER_ID' with actual user UUID from auth.users table

-- INSERT INTO pets (user_id, name, breed, birthday)
-- VALUES 
--   ('YOUR_USER_ID', 'Mochi', 'Shiba Inu', '2020-05-01'),
--   ('YOUR_USER_ID', 'Luna', 'Persian Cat', '2019-03-15');

-- INSERT INTO health_records (pet_id, type, label, value, date, notes)
-- VALUES 
--   ((SELECT id FROM pets WHERE name = 'Mochi' LIMIT 1), 'vaccine', 'Rabies', 'Done', '2023-01-10', 'Annual vaccination'),
--   ((SELECT id FROM pets WHERE name = 'Mochi' LIMIT 1), 'weight', 'Current Weight', '25 lbs', '2023-06-01', 'Healthy weight');

-- INSERT INTO behavior_logs (pet_id, label, notes, date)
-- VALUES 
--   ((SELECT id FROM pets WHERE name = 'Mochi' LIMIT 1), 'Ate well', 'Finished all food', '2024-06-01'),
--   ((SELECT id FROM pets WHERE name = 'Luna' LIMIT 1), 'Playful', 'Played with toys for 30 minutes', '2024-06-01');

-- INSERT INTO reminders (user_id, pet_id, label, type, repeat_interval, due_date)
-- VALUES 
--   ('YOUR_USER_ID', (SELECT id FROM pets WHERE name = 'Mochi' LIMIT 1), 'Rabies Booster', 'vaccine', 'yearly', '2024-12-01T09:00:00Z'),
--   ('YOUR_USER_ID', (SELECT id FROM pets WHERE name = 'Luna' LIMIT 1), 'Vet Checkup', 'checkup', 'monthly', '2024-07-01T10:00:00Z'); 