const mongoose = require('mongoose');
const marketPriceSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  currentPrice: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  trend: { type: String, enum: ['Up', 'Down', 'Stable'], default: 'Stable' },
  priceHistory: [{ date: { type: Date, default: Date.now }, price: { type: Number, required: true } }],
}, { timestamps: true });
module.exports = mongoose.model('MarketPrice', marketPriceSchema);
