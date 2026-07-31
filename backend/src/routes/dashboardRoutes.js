// /src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardData, streamDashboard} = require('../controllers/dashboardController');

// implementasi middleware verify auth pada RealTime dashboard agak sulit dilakukan

// One Time
// ENDPOINT GET /api/dashboard
router.get('/', getDashboardData); 

// Real Time
// ENDPOINT GET /api/dashboard/stream
router.get('/stream', streamDashboard);

module.exports = router;