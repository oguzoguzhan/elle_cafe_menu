/*
  # Update existing product sort orders

  This migration updates all products with sort_order = 0 to have sequential sort orders
  starting from 1, based on their creation date.

  1. Changes
    - Updates all products where sort_order = 0
    - Assigns sequential numbers starting from 1
    - Orders by created_at to maintain chronological order
*/

DO $$
DECLARE
  product_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR product_record IN 
    SELECT id FROM products 
    WHERE sort_order = 0 
    ORDER BY created_at
  LOOP
    UPDATE products 
    SET sort_order = counter 
    WHERE id = product_record.id;
    counter := counter + 1;
  END LOOP;
END $$;
