const { pool } = require('./db');

async function check() {
    try {
        const [rows] = await pool.query("SHOW CREATE TABLE orders");
        console.log("CREATE TABLE Statement:");
        console.log(rows[0]['Create Table']);

        const [columns] = await pool.query("SHOW COLUMNS FROM orders");
        console.log("\nColumns:");
        console.table(columns);
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        process.exit();
    }
}

check();
