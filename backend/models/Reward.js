const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Reward name is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'] },
    pointsCost: { type: Number, required: [true, 'Points cost is required'], min: [1, 'Points cost must be at least 1'] },
    category: {
      type: String,
      enum: ['voucher', 'discount', 'donation', 'product'],
      default: 'voucher',
    },
    stock: { type: Number, default: -1 }, // -1 = unlimited
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardSchema);
