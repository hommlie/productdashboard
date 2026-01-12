const express = require('express');
const router = express.Router();
const dashboardController = require('../src/controllers/dashboardController');

router.get('/dashboard/stats', dashboardController.getDashboardData);

module.exports = router;
