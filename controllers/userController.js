const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { firstName, lastName, userName, password } = req.body;

  if (!firstName || !lastName || !userName || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = new User({ firstName, lastName, userName, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { userName, password } = req.body;

  try {
    console.log('Login attempt for username:', userName);  // Log incoming request
    
    const user = await User.findOne({ userName: userName });
    if (!user) {
      console.error('User not found:', userName);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found. Comparing password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('Password mismatch for user:', userName);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Authentication successful. Generating JWT...');
    const token = jwt.sign(
  { 
    id: user._id, 
    userName: user.userName,
    firstname: user.firstName,  // Match frontend's lowercase
    lastname: user.lastName 
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);


res.json({ 
  token,
  user: {
    userName: user.userName,
    firstname: user.firstName,
    lastname: user.lastName
  }
});
  } catch (err) {
    console.error('Login Error:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      message: 'Authentication server error',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};
exports.updateUser = async (req, res) => {
  const { firstName, lastName, userName } = req.body;
  const userId = req.user.id; // From authenticated token

  // Validate input
  if (!firstName && !lastName && !userName) {
    return res.status(400).json({ message: 'At least one field is required for update' });
  }

  try {
    // Find user and update
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (userName) user.userName = userName;

    await user.save();

    // Return updated user data (without password)
    res.json({
      message: 'Profile updated',
      user: {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    // Handle duplicate username error
    if (err.code === 11000 && err.keyPattern.userName) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
exports.search = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Case-insensitive search across firstName, lastName, or userName
    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { userName: regex }
      ]
    }).select('firstName lastName userName');

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};