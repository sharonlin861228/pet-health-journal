-- Add Sample Reminders for Testing
-- Run this in your Supabase SQL Editor after creating the reminders table
-- Make sure to replace the user_id and pet_id with actual values from your database

-- First, get your user ID and pet ID from the database
-- Run these queries to find your IDs:

-- Get your user ID:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Get your pet ID:
-- SELECT id, name FROM pets WHERE user_id = 'your-user-id';

-- Then replace 'YOUR_USER_ID' and 'YOUR_PET_ID' in the INSERT statements below

-- Sample Reminders for Testing
INSERT INTO reminders (user_id, pet_id, label, type, priority, repeat_interval, due_date, description)
VALUES 
  -- Replace 'YOUR_USER_ID' and 'YOUR_PET_ID' with actual values
  ('YOUR_USER_ID', 'YOUR_PET_ID', '狂犬病疫苗', 'vaccine', 'high', 'yearly', '2024-12-01T09:00:00Z', '年度狂犬病疫苗接種'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '獸醫檢查', 'checkup', 'medium', 'monthly', '2024-07-01T10:00:00Z', '定期健康檢查'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '洗澡美容', 'grooming', 'low', 'monthly', '2024-06-15T14:00:00Z', '每月美容護理'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '體重測量', 'health', 'medium', 'weekly', '2024-06-08T08:00:00Z', '每週體重追蹤'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '服用藥物', 'medication', 'high', 'daily', '2024-06-02T20:00:00Z', '晚間藥物'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '心絲蟲預防', 'medication', 'high', 'monthly', '2024-06-30T09:00:00Z', '心絲蟲預防藥物'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '指甲修剪', 'grooming', 'medium', 'bi-weekly', '2024-06-10T15:00:00Z', '指甲修剪護理'),
  ('YOUR_USER_ID', 'YOUR_PET_ID', '驅蟲治療', 'medication', 'medium', 'monthly', '2024-06-25T10:00:00Z', '體內外驅蟲');

-- Verify the reminders were added
SELECT 
  r.id,
  r.label,
  r.type,
  r.priority,
  r.due_date,
  r.is_done,
  p.name as pet_name
FROM reminders r
LEFT JOIN pets p ON r.pet_id = p.id
WHERE r.user_id = 'YOUR_USER_ID'
ORDER BY r.due_date; 