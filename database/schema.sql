-- MySQL Database Schema for Product Catalog Application

CREATE DATABASE IF NOT EXISTS evteksti_dbadi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE evteksti_dbadi;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subdomain (subdomain),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  branch_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_branch_id (branch_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  warning_text TEXT,
  sort_order INT DEFAULT 0,
  branch_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_id (category_id),
  INDEX idx_sort_order (sort_order),
  INDEX idx_branch_id (branch_id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  branch_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key),
  INDEX idx_branch_id (branch_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2a$10$rB8UqKXqQVYX5KZZqKZZqe3KZqKZqKZqKZqKZqKZqKZqKZqKZqKZ.');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('header_title', 'Ürün Kataloğu'),
('header_bg_color', '#3b82f6'),
('header_text_color', '#ffffff'),
('products_per_row', '3'),
('landing_bg_color', '#ffffff'),
('categories_bg_color', '#ffffff'),
('products_bg_color', '#ffffff'),
('nav_bg_color', '#f3f4f6'),
('nav_text_color', '#1f2937'),
('product_warning_text_color', '#dc2626'),
('product_warning_font_size', '14'),
('product_warning_bg_color', '#fef2f2'),
('product_name_color', '#1f2937'),
('product_name_font_size', '18'),
('product_price_color', '#3b82f6'),
('product_price_font_size', '20'),
('category_name_color', '#1f2937'),
('category_name_font_size', '20'),
('product_image_width', '100'),
('back_button_bg_color', '#3b82f6'),
('back_button_text_color', '#ffffff')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
