// /src/routes/authRouses.js

const express = require('express');
const router = express.Router();

// Import Controller
const { login, getMe, logout } = require('../controllers/authController');
// Import middleware Validation
const { validateLogin } = require('../middlewares/validations/authValidation');
const { verifyToken } = require('../middlewares/auth');

// Endpoint: POST /api/auth/login
router.post('/login', validateLogin, login);

// Endpoint: POST /api/v1/auth/signin
// router.post('/signin', validateSignin, Signin);

// Endpoint: GET /api/v1/auth/me
router.get('/me', verifyToken, getMe);

// Endpoint: GET /api/v1/auth/logout
router.post('/logout', verifyToken, logout);


module.exports = router;
