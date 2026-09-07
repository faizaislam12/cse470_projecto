const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });
feedbackSchema.index({ transaction: 1, reviewer: 1 }, { unique: true });
module.exports = mongoose.model('Feedback', feedbackSchema);
