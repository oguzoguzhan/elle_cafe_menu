/*
  # Add Category and Product Text Styling Settings

  1. Changes to `settings` table
    - Add `category_name_color` (text) - Color for category names
    - Add `category_name_font_size` (integer) - Font size for category names
    - Add `product_name_color` (text) - Color for product names
    - Add `product_name_font_size` (integer) - Font size for product names
    - Add `product_description_color` (text) - Color for product descriptions
    - Add `product_description_font_size` (integer) - Font size for product descriptions
    - Add `product_price_color` (text) - Color for product prices
    - Add `product_price_font_size` (integer) - Font size for product prices

  2. Notes
    - All new fields have sensible defaults for immediate usability
    - These settings will be configurable through the admin settings page
    - Settings apply to both category and product display pages
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'category_name_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN category_name_color text DEFAULT '#111827';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'category_name_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN category_name_font_size integer DEFAULT 18;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_name_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_name_color text DEFAULT '#111827';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_name_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_name_font_size integer DEFAULT 18;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_description_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_description_color text DEFAULT '#4B5563';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_description_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_description_font_size integer DEFAULT 14;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_price_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_price_color text DEFAULT '#111827';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_price_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_price_font_size integer DEFAULT 18;
  END IF;
END $$;