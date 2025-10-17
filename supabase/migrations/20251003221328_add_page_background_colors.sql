/*
  # Add background color settings for categories and products pages

  ## Changes
  1. Settings table updates:
    - Add `categories_bg_color` (text, default #F9FAFB) - Categories page background color
    - Add `products_bg_color` (text, default #F9FAFB) - Products page background color

  ## Notes
  These settings allow customization of background colors for categories and products pages.
*/

-- Add new columns to settings table
DO $$
BEGIN
  -- Add categories_bg_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'categories_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN categories_bg_color text DEFAULT '#F9FAFB';
  END IF;

  -- Add products_bg_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'products_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN products_bg_color text DEFAULT '#F9FAFB';
  END IF;
END $$;

-- Update existing settings row with default values
UPDATE settings
SET 
  categories_bg_color = COALESCE(categories_bg_color, '#F9FAFB'),
  products_bg_color = COALESCE(products_bg_color, '#F9FAFB')
WHERE id IS NOT NULL;