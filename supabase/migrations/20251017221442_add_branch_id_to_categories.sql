/*
  # Add branch_id to categories table

  1. Changes to Existing Tables
    - `categories`
      - Add `branch_id` (uuid, foreign key to branches, nullable)
      - If null, category is visible in all branches
      - If set, category is only visible in that specific branch

  2. Notes
    - Existing categories will have branch_id = NULL (visible everywhere)
    - This allows per-branch category filtering
*/

-- Add branch_id to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_branch_id ON categories(branch_id);
