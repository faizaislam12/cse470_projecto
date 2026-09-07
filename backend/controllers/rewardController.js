const Reward = require('../models/Reward');

// @desc    Get all active rewards (browsable by all users)
// @route   GET /api/rewards
// @access  Private (all roles)
exports.getRewards = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isActive: true };
    const rewards = await Reward.find(filter).sort('-createdAt');
    res.json({ success: true, count: rewards.length, data: rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new reward
// @route   POST /api/rewards
// @access  Private (admin only)
exports.createReward = async (req, res) => {
  try {
    const { name, description, pointsCost, category, stock, isActive } = req.body;
    const reward = await Reward.create({
      name,
      description,
      pointsCost,
      category: category || 'voucher',
      stock: stock !== undefined ? stock : -1,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json({ success: true, data: reward });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a reward
// @route   PUT /api/rewards/:id
// @access  Private (admin only)
exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    res.json({ success: true, data: reward });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a reward
// @route   DELETE /api/rewards/:id
// @access  Private (admin only)
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    res.json({ success: true, message: 'Reward deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
