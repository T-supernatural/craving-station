-- Yakoyo Database Fixes and Features
-- Run these SQL statements in Supabase SQL Editor in order

-- BUG 1: Fix RLS policies for profile role access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- BUG 3: Seed restaurant_settings table
INSERT INTO restaurant_settings (
  id, delivery_fee, accept_orders, accept_reservations, opening_hours
) VALUES (
  1,
  1500,
  true,
  true,
  '{
    "monday": {"open": "08:00", "close": "22:00"},
    "tuesday": {"open": "08:00", "close": "22:00"},
    "wednesday": {"open": "08:00", "close": "22:00"},
    "thursday": {"open": "08:00", "close": "22:00"},
    "friday": {"open": "08:00", "close": "23:00"},
    "saturday": {"open": "09:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "21:00"}
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- BUG 5: Add admin_notes column to reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- BUG 5: Allow admins to update reservations
CREATE POLICY "Admins can update reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- FEATURE: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'reservation'
    CHECK (type IN ('reservation', 'order', 'general')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can mark own notifications read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- FEATURE: Create menu-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Admins can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete menu images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );