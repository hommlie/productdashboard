-- Migration to fix orders table address column
USE productdashboard;

-- Drop the constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS `orders.address`;

-- Modify the address column to be JSON type
ALTER TABLE orders MODIFY COLUMN address JSON DEFAULT NULL;
