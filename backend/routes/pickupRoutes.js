const express = require('express');
const router = express.Router();

const {
  schedulePickup,
  reschedulePickup,
  updatePickupStatus,
  getPickupTracking,
  listPickups,
} = require('../controllers/pickupController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Feature 6: Pickup Scheduling
router.post('/', protect, authorize('household', 'business', 'collector', 'admin'), schedulePickup);
router.patch('/:id/reschedule', protect, reschedulePickup);

// Feature 7: Pickup Status Tracking
router.get('/', protect, listPickups);
router.get('/:id', protect, getPickupTracking);
router.patch('/:id/status', protect, authorize('collector', 'admin'), updatePickupStatus);

module.exports = router;