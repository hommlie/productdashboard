const { pool } = require('../../db');

async function getStats(period = 'this month') {
    const periodLower = period?.toLowerCase() || 'this month';

    // Date filter helper
    const getDateFilter = (column = 'created_at') => {
        switch (periodLower) {
            case 'today': return `DATE(${column}) = CURDATE()`;
            case 'this week': return `YEARWEEK(${column}, 1) = YEARWEEK(CURDATE(), 1)`;
            case 'this month': return `MONTH(${column}) = MONTH(CURDATE()) AND YEAR(${column}) = YEAR(CURDATE())`;
            case 'this year': return `YEAR(${column}) = YEAR(CURDATE())`;
            case 'all time': return '1=1';
            default: return `MONTH(${column}) = MONTH(CURDATE()) AND YEAR(${column}) = YEAR(CURDATE())`;
        }
    };

    const dateFilter = getDateFilter();

    // 1. Total Counts (Global - usually not filtered by date, except Revenue/Orders)
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE status = 1');
    const [totalOrders] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE ${dateFilter}`);
    const [totalRevenue] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE order_status != "Cancelled" AND ${dateFilter}`);
    const [totalCustomers] = await pool.query(`SELECT COUNT(*) as count FROM customers WHERE ${getDateFilter('created_at')}`);

    // 2. Row 1 Status Metrics (Snapshot - these are usually current state, not historical)
    const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = "PENDING"');
    const [returnRequests] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = "RETURN_REQUESTED"');
    const [pendingCancel] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = "WAIT_FOR_CANCEL"');
    const [unpaidPayments] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE payment_status = "PENDING"');
    const [outOfStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock <= 0 AND status = 1');

    // 3. Growth Calculation Helper
    async function getGrowthNew(table, dateColumn = 'created_at', isSum = false, sumColumn = 'total_amount', statusFilter = '') {
        let currentFilter = getDateFilter(dateColumn);
        let previousFilter = '';

        switch (periodLower) {
            case 'today':
                previousFilter = `DATE(${dateColumn}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
                break;
            case 'this week':
                previousFilter = `YEARWEEK(${dateColumn}, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)`;
                break;
            case 'this month':
                previousFilter = `MONTH(${dateColumn}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(${dateColumn}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
                break;
            case 'this year':
                previousFilter = `YEAR(${dateColumn}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))`;
                break;
            default:
                previousFilter = `MONTH(${dateColumn}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(${dateColumn}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
        }

        let filter = statusFilter ? ` AND ${statusFilter} ` : '';
        let currSql, prevSql;

        if (isSum) {
            currSql = `SELECT SUM(${sumColumn}) as val FROM ${table} WHERE ${currentFilter} ${filter}`;
            prevSql = `SELECT SUM(${sumColumn}) as val FROM ${table} WHERE ${previousFilter} ${filter}`;
        } else {
            currSql = `SELECT COUNT(*) as val FROM ${table} WHERE ${currentFilter} ${filter}`;
            prevSql = `SELECT COUNT(*) as val FROM ${table} WHERE ${previousFilter} ${filter}`;
        }

        const [curr] = await pool.query(currSql);
        const [prev] = await pool.query(prevSql);

        const currentVal = parseFloat(curr[0].val) || 0;
        const previousVal = parseFloat(prev[0].val) || 0;

        if (previousVal === 0) return currentVal > 0 ? 100 : 0;
        return Math.round(((currentVal - previousVal) / previousVal) * 100);
    }

    const productGrowth = await getGrowthNew('products');
    const orderGrowth = await getGrowthNew('orders');
    const revenueGrowth = await getGrowthNew('orders', 'created_at', true, 'total_amount', 'order_status != "Cancelled"');
    const customerGrowth = await getGrowthNew('customers');

    // 4. Sales Chart (Adapts to period)
    let salesChartSql = '';
    if (periodLower === 'this year') {
        salesChartSql = `
            SELECT DATE_FORMAT(created_at, '%b') as date, SUM(total_amount) as amount, COUNT(*) as orders
            FROM orders
            WHERE ${dateFilter}
            GROUP BY date, MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `;
    } else {
        salesChartSql = `
            SELECT DATE_FORMAT(created_at, '%d %b') as date, SUM(total_amount) as amount, COUNT(*) as orders
            FROM orders
            WHERE ${dateFilter}
            GROUP BY date, DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `;
    }
    const [salesChart] = await pool.query(salesChartSql);

    // 5. Shipping Overview (Always status distribution for the period)
    const [shippingOverview] = await pool.query(`
        SELECT order_status as name, COUNT(*) as value
        FROM orders
        WHERE ${dateFilter}
        GROUP BY order_status
    `);

    // 6. Top Items (Filtered by period)
    const [topBySales] = await pool.query(`
        SELECT p.product_name as name, SUM(oi.quantity) as sales, p.product_image as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE ${getDateFilter('o.created_at')}
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT 5
    `);

    const [topByViews] = await pool.query(`
        SELECT product_name as name, views, product_image as image
        FROM products
        WHERE status = 1
        ORDER BY views DESC
        LIMIT 5
    `);

    const [completedOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE order_status = "DELIVERED"');

    return {
        totalProducts: productCount[0].count,
        totalOrders: totalOrders[0].count,
        totalRevenue: totalRevenue[0].total || 0,
        totalCustomers: totalCustomers[0].count,
        pendingOrders: pendingOrders[0].count,
        returnRequests: returnRequests[0].count,
        pendingCancel: pendingCancel[0].count,
        unpaidPayments: unpaidPayments[0].count,
        outOfStock: outOfStock[0].count,
        completedOrders: completedOrders[0].count,
        growth: {
            products: productGrowth,
            orders: orderGrowth,
            revenue: revenueGrowth,
            customers: customerGrowth
        },
        charts: {
            sales: salesChart,
            shipping: shippingOverview
        },
        topItems: {
            bySales: topBySales,
            byViews: topByViews
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

async function getDetailsByType(type) {
    let query = '';
    let params = [];
    let needsProducts = false;

    switch (type) {
        case 'PENDING_ORDERS':
            query = `
                SELECT o.*, u.name as customer_name
                FROM orders o
                LEFT JOIN customers u ON o.user_id = u.id
                WHERE o.order_status = 'PENDING'
                ORDER BY o.created_at DESC
            `;
            needsProducts = true;
            break;
        case 'RETURN_REQUESTS':
            query = `
                SELECT o.*, u.name as customer_name
                FROM orders o
                LEFT JOIN customers u ON o.user_id = u.id
                WHERE o.order_status = 'RETURN_REQUESTED'
                ORDER BY o.created_at DESC
            `;
            needsProducts = true;
            break;
        case 'PENDING_CANCEL':
            query = `
                SELECT o.*, u.name as customer_name
                FROM orders o
                LEFT JOIN customers u ON o.user_id = u.id
                WHERE o.order_status = 'WAIT_FOR_CANCEL'
                ORDER BY o.created_at DESC
            `;
            needsProducts = true;
            break;
        case 'YET_TO_RECEIVE_PAYMENTS':
            query = `
                SELECT o.*, u.name as customer_name
                FROM orders o
                LEFT JOIN customers u ON o.user_id = u.id
                WHERE o.payment_status = 'PENDING'
                ORDER BY o.created_at DESC
            `;
            break;
        case 'OUT_OF_STOCK':
            query = `
                SELECT id, product_name as name, product_image as image, stock, product_price as price
                FROM products
                WHERE stock <= 0 AND status = 1
            `;
            break;
        case 'COMPLETED_ORDERS':
            query = `
                SELECT o.*, u.name as customer_name
                FROM orders o
                LEFT JOIN customers u ON o.user_id = u.id
                WHERE o.order_status = 'DELIVERED'
                ORDER BY o.created_at DESC
            `;
            needsProducts = true;
            break;
        default:
            return [];
    }

    const [rows] = await pool.query(query, params);

    if (needsProducts && rows.length > 0) {
        const orderIds = rows.map(row => row.id);
        const [items] = await pool.query(`
            SELECT oi.*, p.product_name as name, p.product_image as image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
        `, [orderIds]);

        rows.forEach(row => {
            const orderItems = items.filter(item => item.order_id === row.id);
            row.products = JSON.stringify(orderItems);
        });
    }

    return rows;
}

module.exports = { getStats, getRecentOrders, getDetailsByType };
