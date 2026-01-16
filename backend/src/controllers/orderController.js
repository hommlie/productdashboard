const orderModel = require('../models/orderModel');
const customerModel = require('../models/customerModel');

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

async function placeOrder(req, res) {
    try {
        const { customer, items, totalAmount, paymentMethod } = req.body;

        let userId = customer.id;
        if (!userId) {
            // Check if phone already exists
            const existing = await customerModel.getCustomerByPhone(customer.phone);
            if (existing) {
                userId = existing.id;
            } else {
                userId = await customerModel.createCustomer(customer.name, customer.phone, customer.email);
            }
        }

        const orderId = await orderModel.createOrder(userId, totalAmount, paymentMethod, items, {
            razorpay_order_id: req.body.razorpay_order_id,
            razorpay_payment_id: req.body.razorpay_payment_id || req.body.paymentId,
            razorpay_signature: req.body.razorpay_signature,
            address: req.body.address
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId
        });
    } catch (error) {
        console.error("Place order error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { order_status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(order_status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const updated = await orderModel.updateOrderStatus(id, order_status);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { getAllOrders, getOrderDetails, getMyOrders, placeOrder, updateOrderStatus };
