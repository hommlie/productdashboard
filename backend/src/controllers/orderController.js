const orderModel = require('../models/orderModel');

async function getAllOrders(req, res) {
    try {
        const orders = await orderModel.getAllOrders();
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getOrderDetails(req, res) {
    try {
        const orderId = req.params.id;
        const order = await orderModel.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getMyOrders(req, res) {
    try {
        const userId = req.user.id;
        const orders = await orderModel.getOrdersByUser(userId);
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getAllOrders, getOrderDetails, getMyOrders };
