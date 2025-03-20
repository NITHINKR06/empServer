const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
    profilePhotoUrl: { type: String },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    about: { type: String },
    location: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: { type: Boolean, default: true },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// After a User is updated, update all related bookings.
UserSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Booking = mongoose.model('Booking');
    await Booking.updateMany({ userId: doc._id }, {
      userName: doc.name,
      userEmail: doc.email
    });
  }
});

module.exports = mongoose.model("User", UserSchema);
