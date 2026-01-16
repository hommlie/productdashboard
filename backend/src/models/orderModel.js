const { pool } = require('../../db');

// Get all orders (for admin) with user details
async function getAllOrders() {
    const query = `
        SELECT o.*, u.name as customer_name, u.phone as customer_phone 
        FROM orders o 
        LEFT JOIN customers u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `;
    const [rows] = await pool.query(query);

    // Parse address JSON for each order
    return rows.map(row => {
        let address = null;
        if (row.address) {
            try {
                const parsed = JSON.parse(row.address);
                address = typeof parsed === 'object' ? parsed.address || JSON.stringify(parsed) : parsed;
            } catch (e) {
                address = row.address;
            }
        }
        return {
            ...row,
            address
        };
    });
}

// Get order by ID with items and user details
async function getOrderById(orderId) {
    const [orders] = await pool.query(`
        SELECT o.*, u.name as customer_name, u.phone as customer_phone 
        FROM orders o 
        LEFT JOIN customers u ON o.user_id = u.id 
        WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) return null;

    const order = orders[0];

    // Parse address JSON
    if (order.address) {
        try {
            const parsed = JSON.parse(order.address);
            order.address = typeof parsed === 'object' ? parsed.address || JSON.stringify(parsed) : parsed;
        } catch (e) {
            // Keep as is if parsing fails
        }
    }

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

    // Parse address JSON for each order
    return rows.map(row => {
        let address = null;
        if (row.address) {
            try {
                const parsed = JSON.parse(row.address);
                address = typeof parsed === 'object' ? parsed.address || JSON.stringify(parsed) : parsed;
            } catch (e) {
                address = row.address;
            }
        }
        return {
            ...row,
            address
        };
    });
}

async function createOrder(userId, totalAmount, paymentMethod, items, paymentDetails = {}) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const paymentStatus = paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING';

        // Convert address to JSON format if needed
        let addressJson = null;
        if (paymentDetails.address) {
            if (typeof paymentDetails.address === 'string') {
                addressJson = JSON.stringify({ address: paymentDetails.address });
            } else {
                addressJson = JSON.stringify(paymentDetails.address);
            }
        }

        const [orderResult] = await connection.query(
            `INSERT INTO orders (
                user_id, total_amount, order_status, payment_status, payment_method, 
                razorpay_order_id, razorpay_payment_id, razorpay_signature, address
             ) VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)`,
            [
                userId, totalAmount, paymentStatus, paymentMethod,
                paymentDetails.razorpay_order_id || null,
                paymentDetails.razorpay_payment_id || null,
                paymentDetails.razorpay_signature || null,
                addressJson
            ]
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateOrderStatus(orderId, status) {
    const [result] = await pool.query(
        'UPDATE orders SET order_status = ? WHERE id = ?',
        [status, orderId]
    );
    return result.affectedRows > 0;
}

module.exports = { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrderStatus };
