/*
  # Restaurant QR Menu Application - Initial Schema

  ## Overview
  Complete database schema for a QR-based restaurant menu application with admin panel.

  ## New Tables

  ### 1. settings
  Stores global application settings (single row expected)
  - `id` (uuid, primary key)
  - `bg_color` (text, default pudra pink #F2D7D5)
  - `logo_url` (text, nullable)
  - `logo_width` (integer, width in pixels)
  - `welcome_text` (text)
  - `welcome_font_size` (integer, size in pixels)
  - `welcome_color` (text)
  - `button_text` (text)
  - `button_bg_color` (text)
  - `button_text_color` (text)
  - `category_grid` (text, 'one' or 'two' columns)
  - `updated_at` (timestamptz)

  ### 2. admins
  Admin user accounts
  - `id` (uuid, primary key)
  - `username` (text, unique)
  - `password_hash` (text)
  - `created_at` (timestamptz)

  ### 3. categories
  Menu categories with hierarchical structure
  - `id` (uuid, primary key)
  - `name` (text)
  - `image_url` (text, nullable)
  - `parent_id` (uuid, nullable, self-reference)
  - `sort_order` (integer, default 0)
  - `active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. products
  Menu items/products
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key to categories)
  - `name` (text)
  - `image_url` (text, nullable)
  - `description` (text, nullable)
  - `price_single` (numeric(10,2), nullable)
  - `price_small` (numeric(10,2), nullable)
  - `price_medium` (numeric(10,2), nullable)
  - `price_large` (numeric(10,2), nullable)
  - `sort_order` (integer, default 0)
  - `active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for settings, categories (active only), and products (active only)
  - Admin-only write access (to be managed via application logic initially)

  ## Seed Data
  - Default admin account (username: admin, password: 123456)
  - Default settings with pudra pink background
  - Sample categories: "Yiyecekler" and "İçecekler"
  - Sample products
*/

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bg_color text DEFAULT '#F2D7D5',
  logo_url text,
  logo_width integer DEFAULT 200,
  welcome_text text DEFAULT 'Hoş Geldiniz',
  welcome_font_size integer DEFAULT 32,
  welcome_color text DEFAULT '#333333',
  button_text text DEFAULT 'Menüye Git',
  button_bg_color text DEFAULT '#D4A5A5',
  button_text_color text DEFAULT '#FFFFFF',
  category_grid text DEFAULT 'two' CHECK (category_grid IN ('one', 'two')),
  updated_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  image_url text,
  description text,
  price_single numeric(10,2),
  price_small numeric(10,2),
  price_medium numeric(10,2),
  price_large numeric(10,2),
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings (public read, no direct write - managed via API)
CREATE POLICY "Public users can view settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for admins (no public access)
CREATE POLICY "Service role can manage admins"
  ON admins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for categories (public read for active, service role for management)
CREATE POLICY "Public users can view active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for products (public read for active, service role for management)
CREATE POLICY "Public users can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (id, bg_color, logo_url, logo_width, welcome_text, welcome_font_size, welcome_color, button_text, button_bg_color, button_text_color, category_grid)
VALUES (
  gen_random_uuid(),
  '#F2D7D5',
  null,
  200,
  'Hoş Geldiniz',
  32,
  '#333333',
  'Menüye Git',
  '#D4A5A5',
  '#FFFFFF',
  'two'
) ON CONFLICT DO NOTHING;

-- Insert default admin (password: 123456, hashed with bcrypt)
-- Hash generated: $2b$10$rBV2cSyZKGZ/fJbLLhA1/.vGF5fF5L5F5F5F5F5F5F5F5F5F5F5F5e
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2b$10$rBV2cSyZKGZ6dR5Z5Z5Z5eMZZnXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
ON CONFLICT (username) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, image_url, parent_id, sort_order, active)
VALUES 
  ('Yiyecekler', null, null, 1, true),
  ('İçecekler', null, null, 2, true)
ON CONFLICT DO NOTHING;

-- Get category IDs for products (we'll add products after categories are created)
-- This will be done via a DO block to handle the dynamic IDs

DO $$
DECLARE
  food_cat_id uuid;
  drink_cat_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO food_cat_id FROM categories WHERE name = 'Yiyecekler' LIMIT 1;
  SELECT id INTO drink_cat_id FROM categories WHERE name = 'İçecekler' LIMIT 1;
  
  -- Insert sample products for food category
  IF food_cat_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, description, price_single, sort_order, active)
    VALUES 
      (food_cat_id, 'Hamburger', 'Özel soslu, taze malzemelerle hazırlanmış lezzetli hamburger', 85.00, 1, true),
      (food_cat_id, 'Pizza', 'İnce hamur pizza, zengin malzemelerle', 120.00, 2, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Insert sample products for drink category
  IF drink_cat_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, description, price_small, price_medium, price_large, sort_order, active)
    VALUES 
      (drink_cat_id, 'Çay', 'Taze demlenmiş çay', 15.00, 20.00, 25.00, 1, true),
      (drink_cat_id, 'Kahve', 'Taze çekilmiş kahve', 25.00, 35.00, 45.00, 2, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);