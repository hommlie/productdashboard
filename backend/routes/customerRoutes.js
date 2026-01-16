const express = require('express');
const router = express.Router();
const customerController = require('../src/controllers/customerController');

router.get('/customers', customerController.listCustomers);
router.get('/customers/find', customerController.findCustomer);

module.exports = router;
