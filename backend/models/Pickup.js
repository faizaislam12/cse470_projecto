const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'en_route', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
      required: true,
    },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pickupSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
    },

    // Feature 6: Scheduling fields
    scheduledDate: { type: Date, required: true },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    address: { type: String, required: true },
    contactPhone: { type: String, required: true },
    specialInstructions: { type: String, trim: true, maxlength: 500 },

    // Feature 7: Status tracking fields
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'en_route', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    statusHistory: [statusHistorySchema],
    completedAt: { type: Date },
    cancelledReason: { type: String, trim: true },
  },
  { timestamps: true }
);

pickupSchema.index({ household: 1, status: 1 });
pickupSchema.index({ collector: 1, status: 1 });
pickupSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);