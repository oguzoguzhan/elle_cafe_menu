/*
  # Add product warning styling settings

  ## Changes
  1. Settings table updates:
    - Add `product_warning_color` (text, default #DC2626) - Warning text color
    - Add `product_warning_font_size` (integer, default 14) - Warning font size in pixels

  ## Notes
  These settings allow customization of product warning message styling.
*/

-- Add new columns to settings table
DO $$
BEGIN
  -- Add product_warning_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_warning_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_warning_color text DEFAULT '#DC2626';
  END IF;

  -- Add product_warning_font_size if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_warning_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_warning_font_size integer DEFAULT 14;
  END IF;
END $$;

-- Update existing settings row with default values
UPDATE settings
SET 
  product_warning_color = COALESCE(product_warning_color, '#DC2626'),
  product_warning_font_size = COALESCE(product_warning_font_size, 14)
WHERE id IS NOT NULL;