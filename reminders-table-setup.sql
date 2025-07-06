-- Reminders Table Setup for Pet Health Journal
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reminders table
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reminders
-- Users can view their own reminders
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own reminders
CREATE POLICY "Users can insert their own reminders" ON reminders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own reminders
CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own reminders
CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_is_done ON reminders(is_done);

-- Insert sample data (optional - for testing)
-- Replace 'YOUR_USER_ID' with actual user UUID from auth.users table
-- Replace 'YOUR_PET_ID' with actual pet UUID from pets table

/*
INSERT INTO reminders (user_id, pet_id, label, type, priority, repeat_interval, due_date, description)
VALUES 
  ('YOUR_USER_ID', 'YOUR_PET_ID', 'Rabies Vaccine', 'vaccine', 'high', 'yearly', '2024-12-01T09:00:00Z', 'Annual rabies vaccination'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', 'Vet Checkup', 'checkup', 'medium', 'monthly', '2024-07-01T10:00:00Z', 'Regular health checkup'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', 'Grooming Appointment', 'grooming', 'low', 'monthly', '2024-06-15T14:00:00Z', 'Monthly grooming session'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', 'Weight Measurement', 'health', 'medium', 'weekly', '2024-06-08T08:00:00Z', 'Weekly weight tracking'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', 'Medication Dose', 'medication', 'high', 'daily', '2024-06-02T20:00:00Z', 'Evening medication');
*/

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reminders' 
ORDER BY ordinal_position; 