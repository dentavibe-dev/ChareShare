/*
  # Insert Admin Profile Data

  1. Purpose
    - Add ability to insert new admin profile records
    - Maintain data integrity with proper constraints
    - Enable secure access control

  2. Changes
    - Creates policies for inserting new admin profiles
    - Ensures proper user authorization
    - Maintains existing data
*/

-- Create policy for inserting new admin profiles
CREATE POLICY "Allow users to insert own profile only"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for public read access
CREATE POLICY "Allow public read access to all profiles"
  ON admin_profiles
  FOR SELECT
  TO public
  USING (true);

-- Create policy for updating own profile
CREATE POLICY "Allow users to update own profile only"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);