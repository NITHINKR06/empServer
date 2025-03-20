const User = require("../models/CheckIn");
const BookingsEmployee = require("../models/BookingsEmployee"); // Ensure this path/file matches your Booking model file.
const Employee = require("../models/Employee");
const notificationService = require("../helper/notificationService");

exports.bookEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      userId,
      jobName,
      userName,    // now coming from frontend as "userName"
      userEmail,   // now coming from frontend as "userEmail"
      mobileNumber,
      bookingTime,
      bookingDate, // now coming as a proper Date object
      location,
      currentLocation
    } = req.body;

    // Create a new booking
    const newBooking = new BookingsEmployee({
      employeeId,
      userId,
      jobName,
      userName,
      userEmail,
      mobileNumber,
      bookingTime,
      bookingDate: bookingDate || Date.now(),
      location,
      currentLocation
    });

    await newBooking.save();

    await User.findByIdAndUpdate(userId, { $push: { bookings: newBooking._id } });
    await Employee.findByIdAndUpdate(employeeId, { $push: { bookings: newBooking._id } });

    const employee = await Employee.findById(employeeId);
    const user = await User.findById(userId);

    notificationService.emit('newBooking', { employee, booking: newBooking });

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    // FIX: Use req.params.id because your route defines the parameter as :id
    const bookingId = req.params.id;
    const { status, cancellationReason } = req.body;

    if (!bookingId) {
      console.error("❌ Booking ID is undefined");
      return res.status(400).json({ message: "Booking ID is required" });
    }


    let updateData = { status };
    if (status === "cancelled" && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const booking = await BookingsEmployee.findByIdAndUpdate(bookingId, updateData, { new: true });

    if (!booking) {
      console.error("Booking not found:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    await Employee.findByIdAndUpdate(booking.employeeId, { bookingStatus: status });
    await User.findByIdAndUpdate(booking.userId, { bookingStatus: status });

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await BookingsEmployee.find({ userId });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEmployeeBookings = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const bookings = await BookingsEmployee.find({ employeeId });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingsEmployee.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getBookingsByUserAndEmployee = async (req, res) => {
  try {
    const { userId, employeeId } = req.params;
    
    const bookings = await BookingsEmployee.find({ userId, employeeId }).select('bookingDate');
    
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for this user and employee." });
    }

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
