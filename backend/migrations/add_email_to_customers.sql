-- Migration to ensure customers table has email column
USE productdashboard;

-- Add email column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL AFTER phone;
