/*
  # Add header logo and product grid settings

  ## Changes
  1. Settings table updates:
    - Add `header_logo_url` (text, nullable) - Header logo image URL
    - Add `header_logo_width` (integer, default 120) - Header logo width in pixels
    - Add `header_bg_color` (text, default white #FFFFFF) - Header background color
    - Add `header_height` (integer, default 80) - Header height in pixels
    - Add `product_grid` (text, default 'two') - Product grid layout (one/two columns)

  ## Notes
  These settings allow full customization of the header area and product display grid.
*/

-- Add new columns to settings table
DO $$
BEGIN
  -- Add header_logo_url if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'header_logo_url'
  ) THEN
    ALTER TABLE settings ADD COLUMN header_logo_url text;
  END IF;

  -- Add header_logo_width if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'header_logo_width'
  ) THEN
    ALTER TABLE settings ADD COLUMN header_logo_width integer DEFAULT 120;
  END IF;

  -- Add header_bg_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'header_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN header_bg_color text DEFAULT '#FFFFFF';
  END IF;

  -- Add header_height if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'header_height'
  ) THEN
    ALTER TABLE settings ADD COLUMN header_height integer DEFAULT 80;
  END IF;

  -- Add product_grid if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'product_grid'
  ) THEN
    ALTER TABLE settings ADD COLUMN product_grid text DEFAULT 'two' CHECK (product_grid IN ('one', 'two'));
  END IF;
END $$;

-- Update existing settings row with default values
UPDATE settings
SET 
  header_logo_url = COALESCE(header_logo_url, null),
  header_logo_width = COALESCE(header_logo_width, 120),
  header_bg_color = COALESCE(header_bg_color, '#FFFFFF'),
  header_height = COALESCE(header_height, 80),
  product_grid = COALESCE(product_grid, 'two')
WHERE id IS NOT NULL;