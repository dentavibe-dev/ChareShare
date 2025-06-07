/*
  # Create Doctors Table for Multi-Doctor System

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references auth.users - the admin who created this)
      - `full_name` (text)
      - `specialization` (text)
      - `bio` (text)
      - `profile_image` (text)
      - `locations` (jsonb array)
      - `booking_links` (jsonb array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on doctors table
    - Add policies for:
      - Public read access to active doctors
      - Admins can insert new doctors
      - Admins can update doctors they created
      - Admins can soft-delete doctors they created

  3. Changes
    - Keep existing admin_profiles table for admin user profiles
    - New doctors table for doctor profiles that can be managed by admins
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  specialization text NOT NULL,
  bio text,
  profile_image text,
  locations jsonb DEFAULT '[]'::jsonb,
  booking_links jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors table
CREATE POLICY "Allow public read access to active doctors"
  ON doctors
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admins to insert doctors"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow admins to update their doctors"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create storage bucket for doctor images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'doctor-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('doctor-images', 'doctor-images', true);
  END IF;
END $$;

-- Create storage policies for doctor images
CREATE POLICY "Allow public view access to doctor images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'doctor-images');

CREATE POLICY "Allow authenticated upload to doctor images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctor-images');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_created_by ON doctors(created_by);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);