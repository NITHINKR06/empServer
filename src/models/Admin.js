// server/models/Admin.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Update Admin model
const adminSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    verificationCode: String,
    codeExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
});

adminSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = mongoose.model('Admin', adminSchema);