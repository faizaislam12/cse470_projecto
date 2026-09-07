const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Slow down brute-force attempts on login and password reset
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', authLimiter, resetPassword);
router.patch('/update-password', protect, updatePassword);

// Example of a role-protected route, kept here for reference on how
// other feature modules (e.g. collector marketplace, admin analytics)
// should guard their own routes using the same middleware.
router.get('/admin-only-example', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: `Welcome, admin ${req.user.name}` });
});

module.exports = router;
