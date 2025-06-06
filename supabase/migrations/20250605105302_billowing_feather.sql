/*
  # Create admin profiles table

  1. New Tables
    - `admin_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `specialization` (text)
      - `bio` (text)
      - `profile_image` (text)
      - `locations` (jsonb)
      - `booking_links` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

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

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to read their own profile
CREATE POLICY "Users can read own admin profile"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow admins to update their own profile
CREATE POLICY "Users can update own admin profile"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow admins to insert their own profile
CREATE POLICY "Users can insert own admin profile"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for admin profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-images', 'admin-images', true);

-- Policy to allow authenticated users to upload images
CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'admin-images');

-- Policy to allow public access to view admin profile images
CREATE POLICY "Anyone can view admin profile images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'admin-images');