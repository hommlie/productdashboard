const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../src/controllers/paymentController');

router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyPayment);

module.exports = router;
