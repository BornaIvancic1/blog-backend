const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const appleSignin = require('apple-signin-auth');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Apple envs
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ----------------------------
// Google Login
// ----------------------------
exports.loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Google token required' });

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const { sub, email, given_name, family_name } = ticket.getPayload();

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        userName: email,
        password: '',
        googleId: sub
      });
      await user.save();
    }

    const jwtToken = jwt.sign({
      id: user._id,
      userName: user.userName,
      firstname: user.firstName,
      lastname: user.lastName
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token: jwtToken, user: { userName: user.userName, firstname: user.firstName, lastname: user.lastName } });
  } catch (err) {
    res.status(400).json({ message: 'Invalid Google token', error: err.message });
  }
};

// ----------------------------
// GitHub Login
// ----------------------------
exports.loginWithGitHub = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'GitHub code required' });

  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token',
      querystring.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      }),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.status(400).json({ message: 'Failed to retrieve GitHub token' });

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });

    const { id, name, login } = userRes.data;
    let user = await User.findOne({ githubId: id });

    if (!user) {
      user = new User({
        firstName: name || login,
        lastName: '',
        userName: login,
        password: '',
        githubId: id
      });
      await user.save();
    }

    const jwtToken = jwt.sign({
      id: user._id,
      userName: user.userName,
      firstname: user.firstName,
      lastname: user.lastName
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token: jwtToken, user: { userName: user.userName, firstname: user.firstName, lastname: user.lastName } });
  } catch (err) {
    console.error('GitHub login error:', err.message);
    res.status(400).json({ message: 'GitHub login failed', error: err.message });
  }
};

// ----------------------------
// Apple Login
// ----------------------------
exports.loginWithApple = async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ message: 'Apple token required' });

  try {
    const applePayload = await appleSignin.verifyIdToken(id_token, {
      audience: APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    const { sub, email } = applePayload;
    let user = await User.findOne({ appleId: sub });

    if (!user) {
      user = new User({
        firstName: '',
        lastName: '',
        userName: email,
        password: '',
        appleId: sub
      });
      await user.save();
    }

    const jwtToken = jwt.sign({
      id: user._id,
      userName: user.userName,
      firstname: user.firstName,
      lastname: user.lastName
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token: jwtToken, user: { userName: user.userName, firstname: user.firstName, lastname: user.lastName } });
  } catch (err) {
    res.status(400).json({ message: 'Invalid Apple token', error: err.message });
  }
};

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
exports.searchUsers = async (req, res) => {
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

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};