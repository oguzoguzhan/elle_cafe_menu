/*
  # Add navigation styling settings

  ## Changes
  1. Settings table updates:
    - Add `nav_bg_color` (text, default #FFFFFF) - Navigation/breadcrumb background color
    - Add `nav_text_color` (text, default #374151) - Navigation text color
    - Add `nav_font_size` (integer, default 14) - Navigation font size in pixels

  ## Notes
  These settings allow customization of the navigation/breadcrumb area styling.
*/

-- Add new columns to settings table
DO $$
BEGIN
  -- Add nav_bg_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'nav_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN nav_bg_color text DEFAULT '#FFFFFF';
  END IF;

  -- Add nav_text_color if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'nav_text_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN nav_text_color text DEFAULT '#374151';
  END IF;

  -- Add nav_font_size if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'nav_font_size'
  ) THEN
    ALTER TABLE settings ADD COLUMN nav_font_size integer DEFAULT 14;
  END IF;
END $$;

-- Update existing settings row with default values
UPDATE settings
SET 
  nav_bg_color = COALESCE(nav_bg_color, '#FFFFFF'),
  nav_text_color = COALESCE(nav_text_color, '#374151'),
  nav_font_size = COALESCE(nav_font_size, 14)
WHERE id IS NOT NULL;