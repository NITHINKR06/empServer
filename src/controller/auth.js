const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/CheckIn');
const Employee = require('../models/Employee');

exports.register = async (req, res) => {
  const { name, email, password, role, location, jobName } = req.body;
  try {
    // Check if the email exists in either collection
    const userExists = await User.findOne({ email });
    const employeeExists = await Employee.findOne({ email });

    if (userExists || employeeExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    let newUser;
    if (role === "employee") {
      // Create a new Employee document
      newUser = new Employee({ name, email, password, role, location, jobName });
    } else {
      // Create a new document in the general users collection
      newUser = new User({ name, email, password, role });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    // Create a JWT payload with user id and role
    const payload = { user: { id: newUser.id, role } };
    jwt.sign(payload, "secret", { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Try to find the user in the "users" collection first
      let user = await User.findOne({ email });
      if (!user) {
        // If not found, try the "employees" collection
        user = await Employee.findOne({ email });
        if (!user) {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }
      }
  
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch)
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Create a JWT payload that includes the user id and role
      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  