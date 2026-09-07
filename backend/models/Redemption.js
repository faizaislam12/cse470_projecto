const mongoose = require('mongoose');
const crypto = require('crypto');

const redemptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    pointsSpent: { type: Number, required: true },
    redemptionCode: {
      type: String,
      unique: true,
      default: () => 'GL-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
    },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Redemption', redemptionSchema);
