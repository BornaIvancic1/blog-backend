const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  userName:  { type: String, required: true, unique: true },
  password:  { type: String }, // <-- no longer hard-required
  googleId:  { type: String, unique: true, sparse: true }, // <-- new
});

// Only hash password if it's set and modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparison for standard login
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
