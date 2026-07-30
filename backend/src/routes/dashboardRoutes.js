// /src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// implementasi middleware verify auth pada RealTime dashboard agak sulit dilakukan

// One Time
// ENDPOINT GET /api/dashboard
router.get('/', dashboardController.getDashboardData); 

// Real Time
// ENDPOINT GET /api/dashboard/stream
router.get('/stream', dashboardController.streamDashboard);

module.exports = router;