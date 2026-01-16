const express = require('express');
const router = express.Router();
const dashboardController = require('../src/controllers/dashboardController');

router.get('/dashboard/stats', dashboardController.getDashboardData);
router.get('/dashboard/details', dashboardController.getDashboardDetails);

module.exports = router;
