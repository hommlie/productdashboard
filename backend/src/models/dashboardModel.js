const { pool } = require('../../db');

async function getStats() {
    // Total Counts
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL');
    const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE order_status != "Cancelled"');
    const [customerCount] = await pool.query('SELECT COUNT(*) as count FROM customers');

    // Growth Calculation Helper
    async function getGrowth(table, dateColumn = 'created_at', isSum = false, sumColumn = 'total_amount', statusFilter = '') {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0, 19).replace('T', ' ');
        const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0, 19).replace('T', ' ');

        let currentQuery, previousQuery;
        let filter = statusFilter ? ` AND ${statusFilter} ` : '';

        if (isSum) {
            currentQuery = `SELECT SUM(${sumColumn}) as val FROM ${table} WHERE ${dateColumn} >= '${thirtyDaysAgo}' ${filter}`;
            previousQuery = `SELECT SUM(${sumColumn}) as val FROM ${table} WHERE ${dateColumn} >= '${sixtyDaysAgo}' AND ${dateColumn} < '${thirtyDaysAgo}' ${filter}`;
        } else {
            currentQuery = `SELECT COUNT(*) as val FROM ${table} WHERE ${dateColumn} >= '${thirtyDaysAgo}' ${filter}`;
            previousQuery = `SELECT COUNT(*) as val FROM ${table} WHERE ${dateColumn} >= '${sixtyDaysAgo}' AND ${dateColumn} < '${thirtyDaysAgo}' ${filter}`;
        }

        const [curr] = await pool.query(currentQuery);
        const [prev] = await pool.query(previousQuery);

        const currentVal = parseFloat(curr[0].val) || 0;
        const previousVal = parseFloat(prev[0].val) || 0;

        if (previousVal === 0) return currentVal > 0 ? 100 : 0;
        return Math.round(((currentVal - previousVal) / previousVal) * 100);
    }

    const productGrowth = await getGrowth('products');
    const orderGrowth = await getGrowth('orders');
    const revenueGrowth = await getGrowth('orders', 'created_at', true, 'total_amount', 'order_status != "Cancelled"');
    const customerGrowth = await getGrowth('customers');

    return {
        totalProducts: productCount[0].count,
        totalOrders: orderCount[0].count,
        totalRevenue: totalRevenue[0].total || 0,
        totalCustomers: customerCount[0].count,
        growth: {
            products: productGrowth,
            orders: orderGrowth,
            revenue: revenueGrowth,
            customers: customerGrowth
        }
    };
}

async function getRecentOrders(limit = 5) {
    const query = `
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN customers u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT ?
    `;
    const [rows] = await pool.query(query, [limit]);
    return rows;
}

module.exports = { getStats, getRecentOrders };
