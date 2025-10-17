/*
  # Add Subdomain to Branches

  1. Changes to Existing Tables
    - `branches`
      - Add `subdomain` (text, unique, nullable) - URL subdomain for branch
      - Add unique constraint on subdomain

  2. Notes
    - Subdomain can be null for main/default branch
    - Used for automatic branch detection based on URL
*/

-- Add subdomain column to branches table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'subdomain'
  ) THEN
    ALTER TABLE branches ADD COLUMN subdomain text UNIQUE;
  END IF;
END $$;

-- Create index for faster subdomain lookups
CREATE INDEX IF NOT EXISTS idx_branches_subdomain ON branches(subdomain) WHERE subdomain IS NOT NULL;
