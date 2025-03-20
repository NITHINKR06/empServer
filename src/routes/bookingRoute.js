const express = require("express");
const router = express.Router();
const { 
  bookEmployee, 
  getUserBookings, 
  getBookingById, 
  getEmployeeBookings, 
  updateBookingStatus, 
  getBookingsByUserAndEmployee
} = require("../controller/bookingController");

// Booking routes
router.post("/", bookEmployee);
router.get("/:userId", getUserBookings);
router.get("/employee/:employeeId", getEmployeeBookings);
router.get("/status/:id", getBookingById);
router.patch("/:id", updateBookingStatus);
router.get('/user/:userId/employee/:employeeId', getBookingsByUserAndEmployee);


module.exports = router;
