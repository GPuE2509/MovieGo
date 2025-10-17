const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  verifyOTPValidation,
  resetPasswordValidation,
  banUserValidation
} = require('../dto/request/authDto');

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', upload.single('avatar'), registerValidation, authController.register);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

// Protected routes
router.post('/logout', auth, authController.logout);
router.post('/verify-otp', auth, verifyOTPValidation, authController.verifyOTP);
router.post('/reset-password', auth, resetPasswordValidation, authController.resetPassword);
router.post('/ban', auth, banUserValidation, authController.banUser);

module.exports = router;
