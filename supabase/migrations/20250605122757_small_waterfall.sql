/*
  # Create Admin Profiles Schema

  1. New Tables
    - `admin_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `specialization` (text)
      - `bio` (text)
      - `profile_image` (text)
      - `locations` (jsonb array)
      - `booking_links` (jsonb array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on admin_profiles table
    - Add policies for CRUD operations
    - Create storage bucket for profile images
    - Add storage policies for image upload/view
*/

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  specialization text,
  bio text,
  profile_image text,
  locations jsonb DEFAULT '[]'::jsonb,
  booking_links jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_profiles
CREATE POLICY "Allow public read access"
  ON admin_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own profile"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for profile images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'admin-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('admin-images', 'admin-images', true);
  END IF;
END $$;

-- Create storage policies
CREATE POLICY "Allow public view access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'admin-images');

CREATE POLICY "Allow authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'admin-images');