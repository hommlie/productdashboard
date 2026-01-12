const { pool } = require('../../db');

// Get all orders (for admin) with user details
async function getAllOrders() {
    const query = `
        SELECT o.*, u.name as customer_name, u.email as customer_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
}

// Get order by ID with items and user details
async function getOrderById(orderId) {
    const [orders] = await pool.query(`
        SELECT o.*, u.name as customer_name, u.email as customer_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    
    // Get items
    const [items] = await pool.query(`
        SELECT oi.*, p.product_name, p.product_image 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    `, [orderId]);
    
    order.items = items;
    return order;
}

// Get orders by user
async function getOrdersByUser(userId) {
    const [rows] = await pool.query(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
}

module.exports = { getAllOrders, getOrderById, getOrdersByUser };
