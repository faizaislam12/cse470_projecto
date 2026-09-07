const express = require('express');
const { getMyEcoPoints, getLeaderboard, getPointRates } = require('../controllers/ecoPointsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication; available to all roles
router.get('/me', protect, getMyEcoPoints);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/rates', protect, getPointRates);

module.exports = router;
