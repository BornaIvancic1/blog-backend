const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: false },
  userName:  { type: String, required: true, unique: true },
  password:  { type: String }, 

  googleId:  { type: String, unique: true, sparse: true },
  githubId:  { type: String, unique: true, sparse: true },
  appleId:   { type: String, unique: true, sparse: true }
});

// Hash password only if modified and exists
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords for login
userSchema.methods.comparePassword = function(password) {
  if (!this.password) return false; // No password for OAuth-only users
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
