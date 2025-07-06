-- Complete Database Setup for Pet Health Journal
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create PETS table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  breed TEXT,
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HEALTH RECORDS table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('vaccine', 'checkup', 'medication', 'weight')),
  label TEXT,
  value TEXT,
  date DATE NOT NULL,
  notes TEXT,
  veterinarian TEXT,
  clinic TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create REMINDERS table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  type TEXT, -- e.g. 'vaccine', 'medication', 'grooming', 'checkup', 'custom'
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  repeat_interval TEXT, -- e.g. 'once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'
  due_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create BEHAVIOR LOGS table
CREATE TABLE IF NOT EXISTS behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_behavior_logs_updated_at
  BEFORE UPDATE ON behavior_logs
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for PETS
CREATE POLICY "Users can access their pets" ON pets
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for HEALTH RECORDS
CREATE POLICY "Users can access health records of their pets" ON health_records
  FOR ALL USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Create RLS policies for REMINDERS
CREATE POLICY "Users can access their reminders" ON reminders
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for BEHAVIOR LOGS
CREATE POLICY "Users can access behavior logs of their pets" ON behavior_logs
  FOR ALL USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_is_done ON reminders(is_done);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_pet_id ON behavior_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_date ON behavior_logs(date);

-- Verify all tables were created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('pets', 'health_records', 'reminders', 'behavior_logs')
ORDER BY table_name, ordinal_position; 