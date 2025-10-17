/*
  # Add Language Bar Background Color Setting

  1. Changes
    - Add `language_bar_bg_color` column to settings table
    - Set default value to '#f3f4f6' (light gray)
  
  2. Notes
    - This setting controls the background color of the top language selection bar
    - Uses IF NOT EXISTS to safely add the column
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS language_bar_bg_color TEXT DEFAULT '#f3f4f6';