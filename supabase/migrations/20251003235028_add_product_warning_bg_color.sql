/*
  # Add Product Warning Background Color Setting

  1. Changes to `settings` table
    - Add `product_warning_bg_color` (text) - Background color for product warning messages

  2. Notes
    - Default value set to a light yellow color (#FEF3C7) for warning visibility
    - This setting will be configurable through the admin settings page
    - Applies to product warning display on the Products page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_warning_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_warning_bg_color text DEFAULT '#FEF3C7';
  END IF;
END $$;