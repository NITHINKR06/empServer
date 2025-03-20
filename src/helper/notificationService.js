// notificationService.js
const EventEmitter = require('events');

class NotificationService extends EventEmitter {}
const notificationService = new NotificationService();

// Listener for new booking notifications (notify employee)
notificationService.on('newBooking', ({ employee, booking }) => {
  // In a real app, you might send an email, push notification, or use a socket.
  console.log(
    `Notification to Employee (${employee.email}): You have a new booking from ${booking.userName}.`
  );
});

// Listener for booking status updates (notify both employee and user)
notificationService.on('bookingStatusUpdated', ({ employee, user, bookingStatus }) => {
  console.log(
    `Notification: Booking status updated to "${bookingStatus}". Employee (${employee.email}) and User (${user.email}) have been notified.`
  );
});

module.exports = notificationService;
