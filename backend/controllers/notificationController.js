const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc   Get current user's notifications
 * @route  GET /api/notifications/mine
 * @access any authenticated user
 */
exports.myNotifications = async (req, res) => {
  try {
    const { limit } = req.query;
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(Number(limit) || 100);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return res.status(200).json({ success: true, count: notifications.length, unread, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
  }
};

/**
 * @desc   List all notifications
 * @route  GET /api/notifications
 * @access admin
 */
exports.listAll = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(500);
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
  }
};

/**
 * @desc   Send a notification to a single user or broadcast to everyone
 * @route  POST /api/notifications
 * @access admin
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedId, broadcast } = req.body;

    if (broadcast) {
      const users = await User.find().select('_id');
      await Notification.insertMany(
        users.map((u) => ({ user: u._id, title, message, type: type || 'SYSTEM', relatedId: relatedId || null }))
      );
      return res.status(201).json({ success: true, message: `Notification sent to ${users.length} users.` });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'SYSTEM',
      relatedId: relatedId || null,
    });
    return res.status(201).json({ success: true, data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send notification.', error: err.message });
  }
};

/**
 * @desc   Mark a notification as read
 * @route  PATCH /api/notifications/:id/read
 * @access owner (or admin)
 */
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    if (String(notification.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    notification.isRead = true;
    await notification.save();
    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.', error: err.message });
  }
};

/**
 * @desc   Mark all of the current user's notifications as read
 * @route  PATCH /api/notifications/read-all
 * @access any authenticated user
 */
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.', error: err.message });
  }
};

/**
 * @desc   Delete a notification
 * @route  DELETE /api/notifications/:id
 * @access owner (or admin)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    if (String(notification.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await notification.deleteOne();
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete notification.', error: err.message });
  }
};