-- Yakoyo Database Updates - ALTER Statements Only
-- Run these in Supabase SQL Editor after the initial CREATE statements

-- Add missing columns to existing tables
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paystack_reference text;

-- Drop conflicting menu items policies and recreate them properly
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

-- Recreate menu items policies with separate statements to avoid conflicts
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update menu items" ON menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete menu items" ON menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable Row Level Security on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Recreate orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Drop existing reservations policies
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Anyone can insert reservations" ON reservations;

-- Recreate reservations policies
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Anyone can insert reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Drop existing restaurant settings policies
DROP POLICY IF EXISTS "Admins can manage restaurant settings" ON restaurant_settings;

-- Recreate restaurant settings policies
CREATE POLICY "Admins can manage restaurant settings" ON restaurant_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: restaurant_settings table creation cannot be done with ALTER
-- You still need to run this CREATE TABLE statement separately if the table doesn't exist:
--
-- CREATE TABLE restaurant_settings (
--   id integer PRIMARY KEY DEFAULT 1,
--   restaurant_name text DEFAULT 'Yakoyo Restaurant',
--   restaurant_description text,
--   restaurant_address text,
--   restaurant_phone text,
--   restaurant_email text,
--   delivery_fee numeric DEFAULT 1500,
--   is_open boolean DEFAULT true,
--   opening_hours jsonb DEFAULT '{
--     "monday": {"open": "09:00", "close": "22:00"},
--     "tuesday": {"open": "09:00", "close": "22:00"},
--     "wednesday": {"open": "09:00", "close": "22:00"},
--     "thursday": {"open": "09:00", "close": "22:00"},
--     "friday": {"open": "09:00", "close": "22:00"},
--     "saturday": {"open": "09:00", "close": "22:00"},
--     "sunday": {"open": "09:00", "close": "22:00"}
--   }',
--   updated_at timestamp DEFAULT now()
-- );