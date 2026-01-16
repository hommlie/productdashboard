# Database Migration Guide

## Issue Fixed
This migration fixes the order placement errors:
1. **Missing email column** in the `customers` table
2. **Address constraint error** in the `orders` table (converts address from TEXT to JSON)

## Changes Made

### Backend Code Changes
1. **orderModel.js**: Modified to store address as JSON and parse it when retrieving orders
2. **customerModel.js**: Modified to parse address JSON when retrieving customers

### Database Schema Changes
1. **customers table**: Added `email` column (VARCHAR 255)
2. **orders table**: Changed `address` column from TEXT to JSON

## How to Run the Migrations

### Option 1: Using the Batch Script (Recommended for Windows)
```bash
cd backend
run_migrations.bat
```
You'll be prompted for:
- MySQL username (default: root)
- MySQL password

### Option 2: Manual SQL Execution
If you prefer to run the migrations manually or if the batch script doesn't work:

1. **Open MySQL Command Line or MySQL Workbench**

2. **Run Migration 1: Add Email to Customers**
   ```sql
   USE productdashboard;
   ALTER TABLE customers 
   ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL AFTER phone;
   ```

3. **Run Migration 2: Fix Orders Address Column**
   ```sql
   USE productdashboard;
   ALTER TABLE orders DROP CONSTRAINT IF EXISTS `orders.address`;
   ALTER TABLE orders MODIFY COLUMN address JSON DEFAULT NULL;
   ```

## After Running Migrations

1. **Restart the backend server** (if it's running)
   ```bash
   # Press Ctrl+C to stop the server, then:
   npm start
   ```

2. **Test Order Placement**
   - Try placing an order from the frontend
   - The address will now be stored as JSON: `{"address": "your address here"}`
   - All existing orders will still work (backward compatible)

## Troubleshooting

### If you get "mysql: command not found"
- Make sure MySQL is installed and added to your system PATH
- Or use MySQL Workbench to run the SQL commands manually

### If you get permission errors
- Make sure you're using a MySQL user with ALTER TABLE privileges
- Try using the root user

### If the constraint drop fails
- This is okay! It means the constraint didn't exist in the first place
- The important part is the `MODIFY COLUMN` command

## Verification

After running the migrations, verify everything works:

1. **Check the customers table:**
   ```sql
   DESCRIBE productdashboard.customers;
   ```
   You should see the `email` column.

2. **Check the orders table:**
   ```sql
   DESCRIBE productdashboard.orders;
   ```
   The `address` column should show type `json`.

3. **Place a test order** from the frontend to ensure everything works correctly.
