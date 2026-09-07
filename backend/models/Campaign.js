const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  targetWeight: { type: Number, default: 0 },
  currentWeight: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Upcoming', 'Active', 'Ended'], default: 'Upcoming' },
}, { timestamps: true });

const campaignParticipantSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  email: { type: String },
  role: { type: String },
  isSponsor: { type: Boolean, default: false },
  contributionKg: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

campaignParticipantSchema.index({ campaignId: 1, user: 1 }, { unique: true });

exports.Campaign = mongoose.model('Campaign', campaignSchema);
exports.CampaignParticipant = mongoose.model('CampaignParticipant', campaignParticipantSchema);