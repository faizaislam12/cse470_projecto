const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  type: { type: String, enum: ['SYSTEM', 'OFFER', 'COUNTER_OFFER', 'PICKUP', 'CAMPAIGN', 'REWARD', 'TRANSACTION'], default: 'SYSTEM' },
  relatedId: { type: String, default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);