const express = require('express');
const { getRewards, createReward, updateReward, deleteReward } = require('../controllers/rewardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getRewards);
router.post('/', protect, authorize('admin'), createReward);
router.put('/:id', protect, authorize('admin'), updateReward);
router.delete('/:id', protect, authorize('admin'), deleteReward);

module.exports = router;
