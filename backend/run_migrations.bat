@echo off
echo ===================================
echo Database Migration Script
echo ===================================
echo.
echo This script will:
echo 1. Add email column to customers table (if missing)
echo 2. Fix orders address column (convert to JSON)
echo.

set /p DB_USER="Enter MySQL username (default: root): " || set DB_USER=root
set /p DB_PASS="Enter MySQL password: "

echo.
echo Running migration 1: Add email to customers...
mysql -u %DB_USER% -p%DB_PASS% < migrations\add_email_to_customers.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 1 failed!
    pause
    exit /b 1
)
echo Migration 1 completed successfully!

echo.
echo Running migration 2: Fix orders address column...
mysql -u %DB_USER% -p%DB_PASS% < migrations\fix_orders_address_column.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 2 failed!
    pause
    exit /b 1
)
echo Migration 2 completed successfully!

echo.
echo ===================================
echo All migrations completed successfully!
echo ===================================
pause
