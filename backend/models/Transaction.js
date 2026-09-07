const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  weight: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  totalAmount: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  offeredAmount: { type: Number },
  scheduledDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Negotiating', 'Scheduled', 'Completed', 'Cancelled'], default: 'Pending' },
  history: [{
    action: String,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transactionSchema);
