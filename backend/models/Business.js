const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true, trim: true },
  businessType: { type: String, enum: ['Retail', 'Manufacturing', 'Restaurant', 'Office', 'Other'], default: 'Other' },
  phone: { type: String },
  address: { type: String },
  logo: { type: String, default: '' },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Suspended'], default: 'Pending' },
  totalRecycled: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);