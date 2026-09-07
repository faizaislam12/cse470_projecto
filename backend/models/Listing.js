const mongoose = require('mongoose');
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  weight: { type: Number, required: true },
  unit: { type: String, default: 'kg', enum: ['kg', 'g', 'lbs', 'items'] },
  price: { type: Number, required: true, default: 0 },
  address: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Pending', 'Completed'], default: 'Available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Listing', listingSchema);
