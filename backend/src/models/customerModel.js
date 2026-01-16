const { pool } = require('../../db');

async function getAllCustomers() {
    // Get customers with their most recent order address
    const query = `
        SELECT c.*, 
        (SELECT address FROM orders WHERE user_id = c.id ORDER BY created_at DESC LIMIT 1) as address_json
        FROM customers c 
        ORDER BY c.name ASC
    `;
    const [rows] = await pool.query(query);

    // Parse address JSON for each customer
    return rows.map(row => {
        let address = null;
        if (row.address_json) {
            try {
                const parsed = JSON.parse(row.address_json);
                address = typeof parsed === 'object' ? parsed.address || JSON.stringify(parsed) : parsed;
            } catch (e) {
                address = row.address_json;
            }
        }
        return {
            ...row,
            address,
            address_json: undefined // Remove the temporary field
        };
    });
}

async function getCustomerByPhone(phone) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
    return rows[0];
}

async function createCustomer(name, phone, email = null) {
    const [result] = await pool.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email]
    );
    return result.insertId;
}

module.exports = { getAllCustomers, getCustomerByPhone, createCustomer };
