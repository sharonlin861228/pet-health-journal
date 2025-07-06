-- Safe Database Setup for Pet Health Journal
-- Run this in your Supabase SQL Editor to create missing tables safely

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create PETS table (if not exists)
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

-- Create HEALTH RECORDS table (if not exists)
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

-- Create REMINDERS table (if not exists)
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

-- Create BEHAVIOR LOGS table (if not exists)
CREATE TABLE IF NOT EXISTS behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers safely (drop if exists first)
DO $$ 
BEGIN
    -- Pets triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pets_updated_at') THEN
        CREATE TRIGGER update_pets_updated_at
          BEFORE UPDATE ON pets
          FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    END IF;
    
    -- Health records triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_health_records_updated_at') THEN
        CREATE TRIGGER update_health_records_updated_at
          BEFORE UPDATE ON health_records
          FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    END IF;
    
    -- Reminders triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reminders_updated_at') THEN
        CREATE TRIGGER update_reminders_updated_at
          BEFORE UPDATE ON reminders
          FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    END IF;
    
    -- Behavior logs triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_behavior_logs_updated_at') THEN
        CREATE TRIGGER update_behavior_logs_updated_at
          BEFORE UPDATE ON behavior_logs
          FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies safely (drop if exists first)
DO $$ 
BEGIN
    -- Pets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pets' AND policyname = 'Users can access their pets') THEN
        CREATE POLICY "Users can access their pets" ON pets
          FOR ALL USING (user_id = auth.uid());
    END IF;
    
    -- Health records policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_records' AND policyname = 'Users can access health records of their pets') THEN
        CREATE POLICY "Users can access health records of their pets" ON health_records
          FOR ALL USING (
            pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
          );
    END IF;
    
    -- Reminders policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Users can access their reminders') THEN
        CREATE POLICY "Users can access their reminders" ON reminders
          FOR ALL USING (user_id = auth.uid());
    END IF;
    
    -- Behavior logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'behavior_logs' AND policyname = 'Users can access behavior logs of their pets') THEN
        CREATE POLICY "Users can access behavior logs of their pets" ON behavior_logs
          FOR ALL USING (
            pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
          );
    END IF;
END $$;

-- Create indexes safely (if not exists)
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