const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  myNotifications,
  listAll,
  sendNotification,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/mine', protect, myNotifications);
router.patch('/read-all', protect, markAllRead);

router.get('/', protect, authorize('admin'), listAll);
router.post('/', protect, authorize('admin'), sendNotification);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;