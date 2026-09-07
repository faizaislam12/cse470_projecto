const express = require('express');
const { redeemReward, getMyRedemptions, getAllRedemptions, updateRedemptionStatus } = require('../controllers/redemptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Order matters: specific paths before parameterized ones
router.get('/mine', protect, getMyRedemptions);
router.get('/', protect, authorize('admin'), getAllRedemptions);
router.post('/', protect, redeemReward);
router.put('/:id', protect, authorize('admin'), updateRedemptionStatus);

module.exports = router;
