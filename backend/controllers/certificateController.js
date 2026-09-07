const Certificate = require('../models/Certificate');
const { getUserImpactStats } = require('../utils/impactCalculator');
const { calculateEnvironmentalImpact } = require('../utils/impactFactors');
const { WEIGHT_MILESTONES } = require('../utils/milestones');

// Issues any weight milestones the user has reached but doesn't hold a
// certificate for yet. Computed lazily on read (like EcoPoints/Goals) rather
// than hooked into transaction completion, so it can't drift out of sync and
// never needs to touch the Transaction feature's code.
async function checkAndIssueMilestones(userId) {
  const stats = await getUserImpactStats(userId);
  const eligible = WEIGHT_MILESTONES.filter((m) => stats.totalWeight >= m.kg);
  if (eligible.length === 0) return;

  const existing = await Certificate.find({ user: userId }).select('milestoneKg');
  const existingKgs = new Set(existing.map((c) => c.milestoneKg));
  const missing = eligible.filter((m) => !existingKgs.has(m.kg));
  if (missing.length === 0) return;

  const impact = calculateEnvironmentalImpact(stats.totalWeight);
  const docs = missing.map((m) => ({
    user: userId,
    milestoneKg: m.kg,
    title: m.title,
    tier: m.tier,
    impactSnapshot: {
      totalWeight: stats.totalWeight,
      ecoPoints: stats.totalPoints,
      co2SavedKg: impact.co2SavedKg,
    },
  }));

  try {
    await Certificate.insertMany(docs, { ordered: false });
  } catch (err) {
    // A duplicate-key error on the (user, milestoneKg) index means a
    // concurrent request already issued it — the unique index is the real
    // guard here, so this race is expected and safe to ignore.
    if (err.code !== 11000) throw err;
  }
}

// @desc    Get the logged-in user's certificates (issuing any newly-earned ones first)
// @route   GET /api/certificates/mine
// @access  Private (all roles)
exports.getMyCertificates = async (req, res) => {
  try {
    await checkAndIssueMilestones(req.user._id);
    const certificates = await Certificate.find({ user: req.user._id }).sort('-issuedDate');
    res.json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get one certificate for the printable detail view
// @route   GET /api/certificates/:id
// @access  Private (owner only)
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'name email');
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
