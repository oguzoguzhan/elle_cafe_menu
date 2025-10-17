/*
  # Add Back Button Color Settings

  1. Changes
    - Add `back_button_bg_color` column to settings table
    - Add `back_button_text_color` column to settings table
    - Set default values for existing records

  2. Details
    - back_button_bg_color: Background color for the back button (default: white)
    - back_button_text_color: Text color for the back button (default: dark gray)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'back_button_bg_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN back_button_bg_color text DEFAULT '#ffffff';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'back_button_text_color'
  ) THEN
    ALTER TABLE settings ADD COLUMN back_button_text_color text DEFAULT '#374151';
  END IF;
END $$;

UPDATE settings
SET
  back_button_bg_color = COALESCE(back_button_bg_color, '#ffffff'),
  back_button_text_color = COALESCE(back_button_text_color, '#374151')
WHERE back_button_bg_color IS NULL OR back_button_text_color IS NULL;
