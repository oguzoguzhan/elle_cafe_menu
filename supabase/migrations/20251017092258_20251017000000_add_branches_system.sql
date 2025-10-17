/*
  # Add Branches System

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text, branch name)
      - `sort_order` (integer, for ordering)
      - `created_at` (timestamp)

    - `category_branches`
      - Junction table linking categories to branches (many-to-many)
      - `category_id` (uuid, foreign key to categories)
      - `branch_id` (uuid, foreign key to branches)
      - Primary key on both columns

  2. Changes to Existing Tables
    - `products`
      - Add `branch_id` (uuid, foreign key to branches)
      - Products belong to one branch

  3. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    - Add policies for authenticated admin operations
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create junction table for categories and branches (many-to-many)
CREATE TABLE IF NOT EXISTS category_branches (
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, branch_id)
);

-- Add branch_id to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE products ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_branches ENABLE ROW LEVEL SECURITY;

-- Policies for branches table
CREATE POLICY "Public can view branches"
  ON branches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert branches"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update branches"
  ON branches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete branches"
  ON branches FOR DELETE
  TO authenticated
  USING (true);

-- Policies for category_branches junction table
CREATE POLICY "Public can view category branches"
  ON category_branches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert category branches"
  ON category_branches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete category branches"
  ON category_branches FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_category_branches_category_id ON category_branches(category_id);
CREATE INDEX IF NOT EXISTS idx_category_branches_branch_id ON category_branches(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branches_sort_order ON branches(sort_order);
