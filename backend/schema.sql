-- Schema for productdashboard
CREATE DATABASE IF NOT EXISTS productdashboard
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
USE productdashboard;

-- Users table (login)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  category_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  category_image VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  category_status TINYINT(1) DEFAULT 1,
  status TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  category_id INT NOT NULL,
  subcategory_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  subcategory_image VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  subcategory_status TINYINT(1) DEFAULT 1,
  status TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_subcategories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  subcategory_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255),
  product_desc TEXT,
  contains JSON,
  product_price DECIMAL(10,2) DEFAULT 0.00,
  product_discount_price DECIMAL(10,2) DEFAULT 0.00,
  tax_percentage DECIMAL(5,2) DEFAULT 0.00,
  estimated_time VARCHAR(255),
  product_status TINYINT(1) DEFAULT 1,
  status TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 9999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
