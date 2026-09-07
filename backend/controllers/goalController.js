const Goal = require('../models/Goal');
const { getUserImpactStats } = require('../utils/impactCalculator');

const GOAL_TYPE_UNITS = {
  totalWeight: 'kg recycled',
  categoryWeight: 'kg recycled',
  ecoPoints: 'EcoPoints earned',
};

// Computes a goal's live progress from completed transactions, and persists
// completed/expired status transitions as they're discovered.
async function computeProgress(goal) {
  const categoryId = goal.category?._id || goal.category;
  const stats = await getUserImpactStats(goal.user, {
    from: goal.startDate,
    to: goal.endDate,
    category: goal.type === 'categoryWeight' ? categoryId : undefined,
  });

  const current = goal.type === 'ecoPoints' ? stats.totalPoints : stats.totalWeight;
  const percent = Math.min(100, Math.round((current / goal.targetValue) * 100));

  if (goal.status === 'active') {
    if (current >= goal.targetValue) {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await goal.save();
    } else if (new Date() > goal.endDate) {
      goal.status = 'expired';
      await goal.save();
    }
  }

  return { ...goal.toObject(), current, percent, unit: GOAL_TYPE_UNITS[goal.type] };
}

// @desc    Create a personal recycling goal
// @route   POST /api/goals
// @access  Private (all roles)
exports.createGoal = async (req, res) => {
  try {
    const { type, category, targetValue, startDate, endDate } = req.body;
    if (!type || !targetValue || !endDate) {
      return res.status(400).json({ success: false, message: 'type, targetValue and endDate are required' });
    }
    if (type === 'categoryWeight' && !category) {
      return res.status(400).json({ success: false, message: 'category is required for a category-specific goal' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      type,
      category: type === 'categoryWeight' ? category : undefined,
      targetValue,
      startDate: startDate || new Date(),
      endDate,
    });

    res.status(201).json({ success: true, data: await computeProgress(goal) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get the logged-in user's goals with live progress
// @route   GET /api/goals/mine
// @access  Private (all roles)
exports.getMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate('category', 'name icon').sort('-createdAt');
    const withProgress = await Promise.all(goals.map(computeProgress));
    res.json({ success: true, count: withProgress.length, data: withProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private (owner only)
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    await goal.deleteOne();
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
