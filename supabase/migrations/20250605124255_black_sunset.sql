/*
  # Fix Admin Profiles Policies

  1. Changes
    - Add more specific RLS policies
    - Keep existing data intact
    - No destructive operations
    
  2. Security
    - Public can read all profiles
    - Authenticated users can only insert/update their own profiles
    - Maintain storage policies
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON admin_profiles;

-- Create new specific policies
CREATE POLICY "Allow public read access to all profiles"
  ON admin_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow users to insert own profile only"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own profile only"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);