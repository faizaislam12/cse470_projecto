const { getUserImpactStats } = require('../utils/impactCalculator');
const { calculateEnvironmentalImpact } = require('../utils/impactFactors');

// @desc    Get the logged-in user's environmental impact dashboard
// @route   GET /api/impact/me
// @access  Private (all roles)
exports.getMyImpact = async (req, res) => {
  try {
    const stats = await getUserImpactStats(req.user._id);
    const impact = calculateEnvironmentalImpact(stats.totalWeight);

    res.json({
      success: true,
      data: {
        totalWeight: stats.totalWeight,
        totalTransactions: stats.totalTransactions,
        ecoPoints: req.user.ecoPoints || 0,
        ...impact,
        categoryBreakdown: stats.categoryBreakdown,
        monthlyTrend: stats.monthlyTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
