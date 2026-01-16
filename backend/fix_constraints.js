const { pool } = require('./db');

async function fix() {
    try {
        // Drop the CHECK constraint. In MariaDB/MySQL, we often need to redefine the column or use ALTER TABLE DROP CONSTRAINT if named.
        // Looking at the SHOW CREATE TABLE output:
        // `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`address`))
        // The constraint is unnamed or named after the column.

        console.log("Removing JSON constraint from orders table...");

        // Strategy: Modify the column to remove the check constraint.
        // In many MariaDB/MySQL setups, redefining the column without the CHECK clause works.
        await pool.query("ALTER TABLE orders MODIFY COLUMN address LONGTEXT DEFAULT NULL;");

        console.log("Migration successful: JSON constraint removed from orders.address");

        // Also check customers table for similar constraints just in case
        const [custColumns] = await pool.query("SHOW COLUMNS FROM customers");
        console.log("\nCustomers structure:");
        console.table(custColumns);

    } catch (err) {
        console.error("Fix failed:", err);
    } finally {
        process.exit();
    }
}

fix();
