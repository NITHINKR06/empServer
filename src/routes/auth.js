const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const { sendOTP, resetPassword } = require("../controller/authController");

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);


// Route for sending OTP
router.post("/sendOTP", sendOTP);

// Route for resetting password
router.post("/resetPassword", resetPassword);

module.exports = router;
