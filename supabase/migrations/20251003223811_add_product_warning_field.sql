/*
  # Add warning field to products table

  ## Changes
  1. Products table updates:
    - Add `warning` (text, nullable) - Warning message to display in product modal

  ## Notes
  This field allows products to have optional warning messages displayed to users.
*/

-- Add warning column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'warning'
  ) THEN
    ALTER TABLE products ADD COLUMN warning text;
  END IF;
END $$;