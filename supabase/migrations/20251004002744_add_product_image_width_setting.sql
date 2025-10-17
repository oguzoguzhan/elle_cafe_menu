/*
  # Add product image width setting

  1. Changes
    - Add `product_image_width` column to `settings` table
    - Default value is 100 (100% width)
    - Allows admin to control product image display width as percentage

  2. Notes
    - This setting will be used in the Products page to control image width
    - Value represents percentage (e.g., 50 = 50% width, 100 = 100% width)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_image_width'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_image_width INTEGER DEFAULT 100;
  END IF;
END $$;
