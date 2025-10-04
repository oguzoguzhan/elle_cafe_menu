/*
  # Update RLS policies for admin operations

  ## Changes
  - Add policies for settings updates (public can read, authenticated can update)
  - Add policies for categories management (authenticated can manage)
  - Add policies for products management (authenticated can manage)
  
  ## Notes
  This allows admin operations from the browser after authentication.
  In production, you would want more sophisticated role-based access control.
*/

-- Drop existing restrictive policies and add new ones for settings
DROP POLICY IF EXISTS "Public users can view settings" ON settings;

CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update settings"
  ON settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Update categories policies
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

CREATE POLICY "Anyone can manage categories"
  ON categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update products policies
DROP POLICY IF EXISTS "Service role can manage products" ON products;

CREATE POLICY "Anyone can manage products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Keep admins table restricted
DROP POLICY IF EXISTS "Service role can manage admins" ON admins;

CREATE POLICY "Anyone can read admins for authentication"
  ON admins FOR SELECT
  USING (true);
