const User = require('../models/user');
const Role = require('../models/role');
const { generateToken } = require('../config/jwt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class AuthService {
  // Login user
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email }).populate('roles');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is banned
      if (user.isBannedUser()) {
        throw new Error('Account is temporarily banned');
      }

      // Check if account is active
      if (user.status !== 'ACTIVE') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failedLoginAttempts += 1;
        user.lastFailedLogin = new Date();
        
        // Ban user if too many failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.status = 'BLOCKED';
          user.ban_until = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        }
        
        await user.save();
        throw new Error('Invalid email or password');
      }

      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.lastFailedLogin = null;
      await user.save();

      // Generate JWT token
      const token = generateToken({
        id: user._id,
        email: user.email,
        roles: user.roles
      });

      // Return user data without password
      const userData = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        status: user.status,
        point: user.point,
        roles: user.roles,
        created_at: user.created_at
      };

      return {
        user: userData,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const { first_name, last_name, email, password, phone, address } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Ensure default role exists and fetch it
      let defaultRole = await Role.findOne({ role_name: 'ROLE_USER' });
      if (!defaultRole) {
        defaultRole = await Role.create({ role_name: 'ROLE_USER' });
      }

      // Create new user
      const user = new User({
        first_name,
        last_name,
        email,
        password,
        phone,
        address,
        roles: [defaultRole._id]
      });

      await user.save();

      // Generate JWT token
      const token = generateToken({
        id: user._id,
        email: user.email,
        roles: user.roles
      });

      // Return user data without password
      const userDataResponse = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        status: user.status,
        point: user.point,
        roles: user.roles,
        created_at: user.created_at
      };

      return {
        user: userDataResponse,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(token) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    return { message: 'Logout successful' };
  }

  // Ban user
  async banUser(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      user.status = 'BLOCKED';
      user.ban_until = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      return { message: `User with email ${email} has been banned for 24 hours` };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Send email with reset token
      await this.sendResetPasswordEmail(email, resetToken);

      return { message: 'Password reset OTP has been sent to your email', token: resetToken };
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(otp) {
    try {
      const user = await User.findOne({
        otp: otp,
        otpExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired OTP');
      }

      return { message: 'OTP verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(newPassword, token) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired token');
      }

      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return { message: 'Password has been changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Send reset password email
  async sendResetPasswordEmail(email, token) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - Movie Booking',
        html: `
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Use the following token to reset your password:</p>
          <p><strong>Token: ${token}</strong></p>
          <p>This token will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
