const dashboardModel = require('../models/dashboardModel');

async function getDashboardData(req, res) {
    try {
        const stats = await dashboardModel.getStats();
        const recentOrders = await dashboardModel.getRecentOrders(5);

        res.json({
            success: true,
            data: {
                stats,
                recentOrders
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getDashboardData };
