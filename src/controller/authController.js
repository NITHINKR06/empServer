const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../models/CheckIn");
const Employee = require("../models/Employee");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Change if using another provider
  auth: {
    user: "nithinpoojari717@gmail.com",
    pass: "ekszaeejqyudurxv",
  },
});

const findAccountByEmail = async (email) => {
  // Try to find account in both collections
  let account = await User.findOne({ email });
  if (!account) {
    account = await Employee.findOne({ email });
  }
  return account;
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const account = await findAccountByEmail(email);
    if (!account)
      return res.status(404).json({ message: "User/Employee not found" });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry time (10 minutes)
    account.resetOTP = otp;
    account.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await account.save();

    // Email options
    const mailOptions = {
      from: "nithinpoojari717@gmail.com",
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    };

    // Send the email with the OTP
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const account = await findAccountByEmail(email);
    if (!account)
      return res.status(404).json({ message: "User/Employee not found" });

    // Validate OTP and expiry time
    if (account.resetOTP !== otp || account.resetOTPExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password before saving
    const saltRounds = 10;
    account.password = await bcrypt.hash(newPassword, saltRounds);

    // Clear OTP fields
    account.resetOTP = undefined;
    account.resetOTPExpires = undefined;
    await account.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
