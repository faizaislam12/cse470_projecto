const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'recycle' },
  defaultPointsPerKg: { type: Number, default: 10 },
  defaultPricePerKg: { type: Number, default: 0.5 },
}, { timestamps: true });
module.exports = mongoose.model('Category', categorySchema);
