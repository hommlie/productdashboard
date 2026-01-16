# Database Migration Script for PowerShell
# Run this script to apply all pending migrations

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Database Migration Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Add email column to customers table (if missing)" -ForegroundColor Yellow
Write-Host "2. Fix orders address column (convert to JSON)" -ForegroundColor Yellow
Write-Host ""

# Get MySQL credentials
$DB_USER = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) {
    $DB_USER = "root"
}

$DB_PASS_SECURE = Read-Host "Enter MySQL password" -AsSecureString
$DB_PASS = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASS_SECURE)
)

Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Green

# Migration 1: Add email to customers
Write-Host "Running migration 1: Add email to customers..." -ForegroundColor Yellow
$migration1 = Get-Content "migrations\add_email_to_customers.sql" -Raw
$command1 = "mysql -u $DB_USER -p$DB_PASS -e `"$migration1`""
Invoke-Expression $command1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration 1 completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration 1 failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Migration 2: Fix orders address column
Write-Host "Running migration 2: Fix orders address column..." -ForegroundColor Yellow
$migration2 = Get-Content "migrations\fix_orders_address_column.sql" -Raw
$command2 = "mysql -u $DB_USER -p$DB_PASS -e `"$migration2`""
Invoke-Expression $command2

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration 2 completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration 2 failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "All migrations completed successfully!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please restart your backend server to apply the changes." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
