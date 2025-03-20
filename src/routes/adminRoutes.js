const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/admin');
const { userController, employeeController, sendVerificationCode, verifyCode, checkAdminExists, adminSetup, getUserAnalytics, getEmployeeAnalytics } = require('../controller/adminController');

// Apply auth and admin middleware to all admin routes
// router.use(adminMiddleware);

// User routes
router.get('/users', userController.getAllUsers);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Employee routes
router.get('/employees', employeeController.getAllEmployees);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);    
// server/routes/adminRoutes.js (add new routes)
router.get('/exists', checkAdminExists);
router.post('/setup', adminSetup);

router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/employees', getEmployeeAnalytics);

module.exports = router;