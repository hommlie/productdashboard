const express = require('express');
const router = express.Router();
const orderController = require('../src/controllers/orderController');

// Routes for orders
router.get('/orders/all', orderController.getAllOrders);
router.get('/orders/details/:id', orderController.getOrderDetails);
router.get('/orders/my-orders', orderController.getMyOrders);

module.exports = router;
