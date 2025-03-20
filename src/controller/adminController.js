const Admin = require('../models/Admin');
const User = require('../models/CheckIn');
const Employee = require('../models/Employee');
const crypto = require('crypto');
const nodemailer = require("nodemailer");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Change if using another provider
  auth: {
    user: "nithinpoojari717@gmail.com",
    pass: "ekszaeejqyudurxv",
  },
});

// User Management
const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      ).select('-password');
      
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Employee Management
const employeeController = {
  getAllEmployees: async (req, res) => {
    try {
      const employees = await Employee.find().select('-password');
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateEmployee: async (req, res) => {
    try {
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select('-password');
      
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      const employee = await Employee.findByIdAndDelete(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Authentication and Verification Management
const authController = {
  sendVerificationCode: async (req, res) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
  
      const code = crypto.randomInt(100000, 999999).toString();
      admin.verificationCode = code;
      admin.codeExpires = Date.now() + 600000; // Code valid for 10 minutes
      await admin.save();
  
      const mailOptions = {
        from: "nithinpoojari717@gmail.com",
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Verification code sent to ${email}`);
      res.json({ success: true });
  
      // Schedule clearing of the verification code after 1 minute (60000ms)
      setTimeout(async () => {
        try {
          const adminToClear = await Admin.findOne({ email });
          if (adminToClear) {
            adminToClear.verificationCode = undefined;
            adminToClear.codeExpires = undefined;
            await adminToClear.save();
            console.log(`Verification code cleared for ${email}`);
          }
        } catch (error) {
          console.error("Error clearing verification code:", error);
        }
      }, 60000);
  
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ success: false, message: 'Failed to send verification code' });
    }
  },

  verifyCode: async (req, res) => {
    try {
      const { email, code } = req.body;
      const admin = await Admin.findOne({
        email,
        codeExpires: { $gt: Date.now() }
      });
  
      if (!admin || admin.verificationCode !== code) {
        return res.status(400).json({ success: false, message: 'Invalid code' });
      }
  
      // Clear verification code after successful verification
      admin.verificationCode = undefined;
      admin.codeExpires = undefined;
      await admin.save();
  
      res.json({ 
        success: true,
        user: {
          id: admin._id,
          email: admin.email
        }
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

// Admin Setup
const adminSetup = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin account already exists' 
      });
    }
  
    const code = crypto.randomInt(100000, 999999).toString();
    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      verificationCode: code,
      codeExpires: Date.now() + 600000
    });
  
    await admin.save();
  
    const mailOptions = {
      from: "nithinpoojari717@gmail.com",
      to: req.body.email,
      subject: 'Admin Setup Verification Code',
      text: `Your verification code is: ${code}`
    };
  
    await transporter.sendMail(mailOptions);
    console.info('Admin setup verification code sent');
  
    res.json({ success: true });
  } catch (error) {
    console.error('Error in admin setup:', error);
    await Admin.deleteOne({ email: req.body.email });
    res.status(500).json({ 
      success: false,
      message: 'Error creating admin account' 
    });
  }
};

// Check if an admin exists
const checkAdminExists = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.json({ exists: count > 0 });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking admin status' 
    });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true });
    const inactiveUsers = totalUsers - activeUsers;

    let monthlyRegistrations = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
      monthlyRegistrations.push(count);
    }

    res.json({ totalUsers, activeUsers, inactiveUsers, monthlyRegistrations });
  } catch (err) {
    console.error("Error computing user analytics:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeeAnalytics = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ active: true });
    const inactiveEmployees = totalEmployees - activeEmployees;

    let monthlyRegistrations = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await Employee.countDocuments({ createdAt: { $gte: start, $lt: end } });
      monthlyRegistrations.push(count);
    }

    res.json({ totalEmployees, activeEmployees, inactiveEmployees, monthlyRegistrations });
  } catch (err) {
    console.error("Error computing employee analytics:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  ...authController,
  checkAdminExists,
  userController,
  employeeController,
  adminSetup,
  getEmployeeAnalytics,
  getUserAnalytics
};
