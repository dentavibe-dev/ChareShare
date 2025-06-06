/*
  # Fix Admin Profiles Schema and Policies

  1. Changes
    - Drop existing policies
    - Create new, more permissive policies
    - Add public read access
    - Allow proper insert/update for authenticated users

  2. Security
    - Maintain RLS
    - Allow public read access
    - Restrict write operations to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON admin_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON admin_profiles;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON admin_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);