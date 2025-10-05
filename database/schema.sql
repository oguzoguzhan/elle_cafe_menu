-- Product Catalog Database Schema
-- This schema includes all tables, indexes, and initial data

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  warning_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_category_sort (category_id, sort_order),
  INDEX idx_category (category_id),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  logo_url TEXT,
  header_logo_url TEXT,
  site_title VARCHAR(255) DEFAULT 'Ürün Kataloğu',
  header_bg_color VARCHAR(7) DEFAULT '#ffffff',
  header_text_color VARCHAR(7) DEFAULT '#000000',
  landing_bg_color VARCHAR(7) DEFAULT '#f3f4f6',
  categories_bg_color VARCHAR(7) DEFAULT '#ffffff',
  products_bg_color VARCHAR(7) DEFAULT '#ffffff',
  nav_bg_color VARCHAR(7) DEFAULT '#3b82f6',
  nav_text_color VARCHAR(7) DEFAULT '#ffffff',
  nav_hover_bg_color VARCHAR(7) DEFAULT '#2563eb',
  category_grid_cols INT DEFAULT 3,
  category_text_color VARCHAR(7) DEFAULT '#1f2937',
  product_grid_cols INT DEFAULT 3,
  product_name_color VARCHAR(7) DEFAULT '#1f2937',
  product_price_color VARCHAR(7) DEFAULT '#059669',
  product_description_color VARCHAR(7) DEFAULT '#6b7280',
  product_warning_color VARCHAR(7) DEFAULT '#dc2626',
  product_warning_bg_color VARCHAR(7) DEFAULT '#fee2e2',
  product_image_width INT DEFAULT 100,
  back_button_bg_color VARCHAR(7) DEFAULT '#3b82f6',
  back_button_text_color VARCHAR(7) DEFAULT '#ffffff',
  back_button_hover_bg_color VARCHAR(7) DEFAULT '#2563eb',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO settings (
  site_title,
  header_bg_color,
  header_text_color,
  landing_bg_color,
  categories_bg_color,
  products_bg_color,
  nav_bg_color,
  nav_text_color,
  nav_hover_bg_color,
  category_grid_cols,
  category_text_color,
  product_grid_cols,
  product_name_color,
  product_price_color,
  product_description_color,
  product_warning_color,
  product_warning_bg_color,
  product_image_width,
  back_button_bg_color,
  back_button_text_color,
  back_button_hover_bg_color
) VALUES (
  'Ürün Kataloğu',
  '#ffffff',
  '#000000',
  '#f3f4f6',
  '#ffffff',
  '#ffffff',
  '#3b82f6',
  '#ffffff',
  '#2563eb',
  3,
  '#1f2937',
  3,
  '#1f2937',
  '#059669',
  '#6b7280',
  '#dc2626',
  '#fee2e2',
  100,
  '#3b82f6',
  '#ffffff',
  '#2563eb'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash is bcrypt hash of "admin123"
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$rZ8qNYxVQXyEK.zG5qYvK.Ym4LGvH6F8JKj5p3nK4TyXwZY9bC8pK')
ON DUPLICATE KEY UPDATE username=username;
