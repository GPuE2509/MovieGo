const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  // Login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Register
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Register successful',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const result = await authService.logout(req.token);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Ban user
  async banUser(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.banUser(email);

      res.status(200).json({
        success: true,
        message: 'User banned successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { otp } = req.body;
      const userId = req.user?.id;
      const result = await authService.verifyOTP(userId, otp);

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { newPassword } = req.body;
      const userId = req.user?.id;
      const result = await authService.resetPassword(userId, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
