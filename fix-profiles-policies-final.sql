-- ULTIMATE SIMPLE FIX - Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable with minimal policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Only basic user policies - no admin policies for now
CREATE POLICY "Users can manage own profiles" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (true);