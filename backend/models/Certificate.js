const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    milestoneKg: { type: Number, required: true },
    title: { type: String, required: true },
    tier: { type: String },
    certificateCode: {
      type: String,
      unique: true,
      default: () => 'GL-CERT-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
    },
    issuedDate: { type: Date, default: Date.now },
    impactSnapshot: {
      totalWeight: Number,
      ecoPoints: Number,
      co2SavedKg: Number,
    },
  },
  { timestamps: true }
);

// Guards against issuing the same milestone twice for a user, including
// under a race between two concurrent requests to GET /certificates/mine.
certificateSchema.index({ user: 1, milestoneKg: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
