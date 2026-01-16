const { pool } = require('./db');

async function migrate() {
    try {
        const [columns] = await pool.query("SHOW COLUMNS FROM customers");
        const hasEmail = columns.some(col => col.Field === 'email');

        if (!hasEmail) {
            await pool.query("ALTER TABLE customers ADD COLUMN email VARCHAR(255) DEFAULT NULL;");
            console.log("Migration successful: added email column to customers");
        } else {
            console.log("Column 'email' already exists in customers table.");
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
