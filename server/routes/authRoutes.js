const express = require('express');
const { 
  registerUser, 
  verifyUser, 
  resendCode, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  updateProfile, 
  toggleTwoFactor,
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyUser);
router.post('/resend', resendCode);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/toggle-2fa', protect, toggleTwoFactor);

module.exports = router;
