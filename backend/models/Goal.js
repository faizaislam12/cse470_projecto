const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['totalWeight', 'ecoPoints', 'categoryWeight'],
      required: [true, 'Goal type is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: function () {
        return this.type === 'categoryWeight';
      },
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target must be at least 1'],
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: [true, 'End date is required'] },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
