/*
  # Ensure unique sort orders per category

  This migration ensures each product has a unique sort order within its category.
  If duplicate sort orders exist, products are renumbered sequentially starting from 1.

  1. Changes
    - Groups products by category_id
    - Assigns unique sequential sort_order starting from 1 within each category
    - Orders by current sort_order, then created_at to maintain relative order
*/

DO $$
DECLARE
  cat_record RECORD;
  product_record RECORD;
  counter INTEGER;
BEGIN
  FOR cat_record IN 
    SELECT DISTINCT category_id FROM products ORDER BY category_id
  LOOP
    counter := 1;
    FOR product_record IN 
      SELECT id FROM products 
      WHERE category_id = cat_record.category_id 
      ORDER BY sort_order, created_at
    LOOP
      UPDATE products 
      SET sort_order = counter 
      WHERE id = product_record.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;
