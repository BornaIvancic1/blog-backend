const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Add this
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check header format more strictly
  if (!authHeader || !/^Bearer .+$/.test(authHeader)) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token and check user existence
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // 3. Attach fresh user data instead of decoded token
    req.user = {
      id: user._id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (err) {
    // 4. More specific error messages
    const message = err.name === 'TokenExpiredError' 
      ? 'Token expired' 
      : 'Invalid token';
      
    return res.status(401).json({ message });
  }
};
