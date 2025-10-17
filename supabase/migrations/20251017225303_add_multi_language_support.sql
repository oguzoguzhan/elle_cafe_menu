/*
  # Add Multi-Language Support

  ## Overview
  Add Turkish and English language support to the application with manual translations.

  ## Changes

  ### 1. Categories Table
  Add language-specific fields:
  - `name_tr` (text) - Turkish category name
  - `name_en` (text) - English category name
  
  Migrate existing data:
  - Copy existing `name` to `name_tr`
  - Set `name` as computed field showing Turkish by default

  ### 2. Products Table
  Add language-specific fields:
  - `name_tr` (text) - Turkish product name
  - `name_en` (text) - English product name
  - `description_tr` (text) - Turkish description
  - `description_en` (text) - English description
  - `warning_tr` (text) - Turkish warning text
  - `warning_en` (text) - English warning text
  
  Migrate existing data:
  - Copy existing fields to `_tr` versions
  - Keep original fields for backward compatibility

  ### 3. Settings Table
  Add language-specific UI text fields:
  - `welcome_text_tr` (text) - Turkish welcome text
  - `welcome_text_en` (text) - English welcome text
  - `button_text_tr` (text) - Turkish button text
  - `button_text_en` (text) - English button text
  - `default_language` (text) - Default language (tr/en), default 'tr'
  
  Migrate existing data:
  - Copy existing texts to `_tr` versions
  - Add default English translations

  ## Security
  - No RLS changes needed
  - All existing policies apply to new columns

  ## Notes
  - Default language is Turkish (tr)
  - English translations will be added by admin
  - Frontend will have language selector
*/

-- Add language columns to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'name_tr'
  ) THEN
    ALTER TABLE categories ADD COLUMN name_tr text;
    ALTER TABLE categories ADD COLUMN name_en text;
    
    -- Migrate existing data
    UPDATE categories SET name_tr = name WHERE name_tr IS NULL;
    
    -- Make name_tr NOT NULL after migration
    ALTER TABLE categories ALTER COLUMN name_tr SET NOT NULL;
  END IF;
END $$;

-- Add language columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'name_tr'
  ) THEN
    ALTER TABLE products ADD COLUMN name_tr text;
    ALTER TABLE products ADD COLUMN name_en text;
    ALTER TABLE products ADD COLUMN description_tr text;
    ALTER TABLE products ADD COLUMN description_en text;
    ALTER TABLE products ADD COLUMN warning_tr text;
    ALTER TABLE products ADD COLUMN warning_en text;
    
    -- Migrate existing data
    UPDATE products SET name_tr = name WHERE name_tr IS NULL;
    UPDATE products SET description_tr = description WHERE description_tr IS NULL;
    UPDATE products SET warning_tr = warning WHERE warning_tr IS NULL;
    
    -- Make name_tr NOT NULL after migration
    ALTER TABLE products ALTER COLUMN name_tr SET NOT NULL;
  END IF;
END $$;

-- Add language columns to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'welcome_text_tr'
  ) THEN
    ALTER TABLE settings ADD COLUMN welcome_text_tr text;
    ALTER TABLE settings ADD COLUMN welcome_text_en text;
    ALTER TABLE settings ADD COLUMN button_text_tr text;
    ALTER TABLE settings ADD COLUMN button_text_en text;
    ALTER TABLE settings ADD COLUMN default_language text DEFAULT 'tr' CHECK (default_language IN ('tr', 'en'));
    
    -- Migrate existing data
    UPDATE settings 
    SET 
      welcome_text_tr = welcome_text,
      welcome_text_en = 'Welcome',
      button_text_tr = button_text,
      button_text_en = 'Go to Menu',
      default_language = 'tr'
    WHERE welcome_text_tr IS NULL;
  END IF;
END $$;
