const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true, maxlength: 100 },
  last_name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, maxlength: 255 },
  password: { type: String, required: true, minlength: 6, maxlength: 255 },
  avatar: { type: String },
  phone: {
    type: String,
    match: [/^(03|05|07|08|09)[0-9]{8}$/, 'Invalid VN phone number'],
    maxlength: 11
  },
  address: { type: String },
  status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE' },
  ban_until: { type: Date },
  point: { type: Number, min: 0, default: 0 },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedLogin: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is banned
userSchema.methods.isBannedUser = function() {
  if (this.status === 'BLOCKED' && this.ban_until && this.ban_until > new Date()) {
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
