const express = require('express');
const router = express.Router();

const {
  schedulePickup,
  reschedulePickup,
  updatePickupStatus,
  getPickupTracking,
  listPickups,
} = require('../controllers/pickupController');

// Assumes existing auth middleware (JWT) and role-based authorization middleware
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Feature 6: Pickup Scheduling
router.post('/', schedulePickup);
router.patch('/:id/reschedule', reschedulePickup);

// Feature 7: Pickup Status Tracking
router.patch('/:id/status', protect, authorize('collector', 'admin'), updatePickupStatus);
router.get('/:id', protect, getPickupTracking);
router.get('/', protect, listPickups);

module.exports = router;

// In server.js / app.js:
// const pickupRoutes = require('./routes/pickupRoutes');
// app.use('/api/pickups', pickupRoutes);