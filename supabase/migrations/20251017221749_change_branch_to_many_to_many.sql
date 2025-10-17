/*
  # Change branch system to many-to-many relationship

  1. Changes
    - Remove `branch_id` from categories table
    - Remove `branch_id` from products table
    - Create `category_branches` junction table for categories-branches many-to-many
    - Create `product_branches` junction table for products-branches many-to-many

  2. Security
    - Enable RLS on new junction tables
    - Add policies for public read and authenticated write

  3. Notes
    - Categories/products with no branch assignments are visible in all branches
    - Multiple branch assignments allow items to appear in specific branches only
*/

-- Drop old branch_id columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE categories DROP COLUMN branch_id;
  END IF;
END $$;

-- Create category_branches junction table (if not exists)
CREATE TABLE IF NOT EXISTS category_branches (
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, branch_id)
);

-- Create product_branches junction table (if not exists)
CREATE TABLE IF NOT EXISTS product_branches (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, branch_id)
);

-- Enable RLS
ALTER TABLE category_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_branches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view category branches" ON category_branches;
DROP POLICY IF EXISTS "Authenticated users can insert category branches" ON category_branches;
DROP POLICY IF EXISTS "Authenticated users can delete category branches" ON category_branches;
DROP POLICY IF EXISTS "Public can view product branches" ON product_branches;
DROP POLICY IF EXISTS "Authenticated users can insert product branches" ON product_branches;
DROP POLICY IF EXISTS "Authenticated users can delete product branches" ON product_branches;

-- Policies for category_branches
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

-- Policies for product_branches
CREATE POLICY "Public can view product branches"
  ON product_branches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert product branches"
  ON product_branches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product branches"
  ON product_branches FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_branches_category_id ON category_branches(category_id);
CREATE INDEX IF NOT EXISTS idx_category_branches_branch_id ON category_branches(branch_id);
CREATE INDEX IF NOT EXISTS idx_product_branches_product_id ON product_branches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_branches_branch_id ON product_branches(branch_id);
