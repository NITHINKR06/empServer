const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee'
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  jobName: { 
    type: String
  },
  userName: { 
    type: String
  },
  userEmail: { 
    type: String
  },
  mobileNumber: { 
    type: String
  },
  bookingTime: { 
    type: String
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  location: { 
    type: String
  },
  currentLocation: { 
    type: String
  },
  status: { 
    type: String, 
    default: "pending" 
  },
  cancellationReason: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
