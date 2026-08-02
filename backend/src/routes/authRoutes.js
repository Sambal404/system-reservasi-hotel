// /src/routes/authRouses.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middlewares/validations/authValidation');

// Endpoint: POST /api/auth/login
router.post('/login', validateLogin, authController);

module.exports = router;
