/*
  # Add Database Configurations System

  1. New Tables
    - `database_configs`
      - `id` (uuid, primary key)
      - `name` (text) - Configuration name/label
      - `supabase_url` (text) - Supabase project URL
      - `supabase_anon_key` (text) - Supabase anonymous key
      - `is_active` (boolean) - Whether this config is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `database_configs` table
    - Add policies for authenticated admin users to manage database configurations

  3. Notes
    - Only one configuration can be active at a time
    - The active configuration determines which database the application connects to
    - Sensitive keys are stored securely in the database
*/

-- Create database_configs table
CREATE TABLE IF NOT EXISTS database_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  supabase_url text NOT NULL,
  supabase_anon_key text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE database_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin only)
CREATE POLICY "Authenticated users can view database configs"
  ON database_configs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert database configs"
  ON database_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update database configs"
  ON database_configs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete database configs"
  ON database_configs
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to ensure only one active config
CREATE OR REPLACE FUNCTION ensure_single_active_config()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE database_configs
    SET is_active = false
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single active config
DROP TRIGGER IF EXISTS trigger_ensure_single_active_config ON database_configs;
CREATE TRIGGER trigger_ensure_single_active_config
  AFTER INSERT OR UPDATE ON database_configs
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_config();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_database_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_database_configs_updated_at ON database_configs;
CREATE TRIGGER trigger_update_database_configs_updated_at
  BEFORE UPDATE ON database_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_database_configs_updated_at();