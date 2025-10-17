/*
  # Add Site Title Setting

  1. Changes
    - Add `site_title` column to settings table
    - Set default value to 'Dijital Menü'
  
  2. Notes
    - This setting controls the browser tab title
    - Uses IF NOT EXISTS to safely add the column
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_title TEXT DEFAULT 'Dijital Menü';