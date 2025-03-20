const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new mongoose.Schema({
  profilePhotoUrl: { type: String },
  name: {
    type: String,
    required: true
  },
  jobName: {
    type: String,
    required: function () { return this.role === 'employee'; }
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  active: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['employee'],
    default: 'employee',
    required: true
  },
  location: {
    type: String,
    required: function () { return this.role === 'employee'; }
  },
  education: { type: String },
  experience: { type: Number, default: 0 },
  about: { type: String },
  reviews: [
    {
      name: { type: String, required: true },
      message: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  resetOTP: { type: String },
  resetOTPExpires: { type: Date }
}, { timestamps: true });

// After an Employee is updated, update all related bookings.
EmployeeSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Booking = mongoose.model('Booking');
    await Booking.updateMany({ employeeId: doc._id }, {
      jobName: doc.jobName
      // Optionally, if you have more fields to sync, add them here.
    });
  }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
