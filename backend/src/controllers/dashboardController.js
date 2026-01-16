const dashboardModel = require('../models/dashboardModel');

async function getDashboardData(req, res) {
    try {
        const { period } = req.query;
        const stats = await dashboardModel.getStats(period);
        const recentOrders = await dashboardModel.getRecentOrders(5);

        res.json({
            success: true,
            data: {
                stats: stats,
                recentOrders
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getDashboardDetails(req, res) {
    try {
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({ success: false, message: 'Type is required' });
        }
        const details = await dashboardModel.getDetailsByType(type);
        res.json({ success: true, data: details });
    } catch (err) {
        console.error('Error fetching dashboard details:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getDashboardData, getDashboardDetails };
