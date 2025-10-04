/*
  # Add Product Text Styling Settings

  1. Changes
    - Add product title font size, color
    - Add product description font size, color
    - Add product price font size, color

  2. Details
    - `product_title_font_size` (integer) - Font size for product titles (default: 18)
    - `product_title_color` (text) - Color for product titles (default: #111827)
    - `product_description_font_size` (integer) - Font size for product descriptions (default: 14)
    - `product_description_color` (text) - Color for product descriptions (default: #4B5563)
    - `product_price_font_size` (integer) - Font size for product prices (default: 18)
    - `product_price_color` (text) - Color for product prices (default: #111827)

  3. Notes
    - These settings will be applied to product cards on the customer-facing products page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_title_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_title_font_size integer DEFAULT 18;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_title_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_title_color text DEFAULT '#111827';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_description_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_description_font_size integer DEFAULT 14;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_description_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_description_color text DEFAULT '#4B5563';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_price_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_price_font_size integer DEFAULT 18;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_price_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_price_color text DEFAULT '#111827';
  END IF;
END $$;