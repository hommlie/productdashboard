-- Seeds for productdashboard
USE productdashboard;

-- Insert an admin user with id=1.
-- WARNING: password stored in plain text here to allow immediate login
-- The application accepts plain-text passwords as a fallback but you should hash
-- passwords for production. To hash, run Node bcrypt as documented earlier.

INSERT INTO users (id, name, email, password, role, created_at)
VALUES (1, 'Admin', 'admin@example.com', 'admin123', 'admin', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role=VALUES(role);

-- Optional sample data
INSERT INTO categories (user_id, category_name, slug, meta_title, meta_description)
VALUES (1, 'Sample Category', 'sample-category', 'Sample Category', 'Sample category description')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

INSERT INTO subcategories (user_id, category_id, subcategory_name, slug, meta_title, meta_description, sort_order)
VALUES (1, 1, 'Sample Subcategory', 'sample-subcategory', 'Sample Subcategory', 'Sample subcategory desc', 1)
ON DUPLICATE KEY UPDATE subcategory_name=VALUES(subcategory_name);

INSERT INTO products (user_id, subcategory_id, product_name, product_desc, contains, product_price, product_discount_price, tax_percentage, estimated_time)
VALUES (1, 1, 'Sample Product', 'Sample product desc', JSON_ARRAY('item1','item2'), 9.99, 7.99, 5.00, '10 mins')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);
