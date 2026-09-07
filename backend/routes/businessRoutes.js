const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getBusinessByUserId,
  createBusinessProfile,
  listBusinesses,
  updateBusinessStatus,
  deleteBusiness,
} = require('../controllers/businessController');

router.get('/user/:userId', protect, getBusinessByUserId);
router.post('/profile', protect, authorize('business'), createBusinessProfile);
router.get('/', protect, authorize('admin'), listBusinesses);
router.patch('/:id/status', protect, authorize('admin'), updateBusinessStatus);
router.delete('/:id', protect, authorize('admin'), deleteBusiness);

module.exports = router;