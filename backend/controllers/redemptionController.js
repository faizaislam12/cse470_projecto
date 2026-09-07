const Redemption = require('../models/Redemption');
const Reward = require('../models/Reward');
const User = require('../models/User');

// @desc    Redeem a reward — deducts EcoPoints and records the redemption
// @route   POST /api/redemptions
// @access  Private (all roles)
exports.redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    if (!rewardId) return res.status(400).json({ success: false, message: 'rewardId is required' });

    const reward = await Reward.findById(rewardId);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    if (!reward.isActive) return res.status(400).json({ success: false, message: 'This reward is no longer available' });
    if (reward.stock === 0) return res.status(400).json({ success: false, message: 'This reward is out of stock' });

    // Fetch fresh user record to get accurate ecoPoints
    const user = await User.findById(req.user._id);
    if ((user.ecoPoints || 0) < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient EcoPoints. You need ${reward.pointsCost} pts but have ${user.ecoPoints || 0} pts.`,
      });
    }

    // Deduct points from user
    user.ecoPoints = (user.ecoPoints || 0) - reward.pointsCost;
    await user.save({ validateBeforeSave: false });

    // Decrement stock if not unlimited
    if (reward.stock > 0) {
      reward.stock -= 1;
      await reward.save();
    }

    // Create redemption record
    const redemption = await Redemption.create({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.pointsCost,
    });

    const populated = await Redemption.findById(redemption._id).populate('reward', 'name description category pointsCost');

    res.status(201).json({
      success: true,
      message: `Successfully redeemed "${reward.name}"! Your code is ${redemption.redemptionCode}.`,
      data: populated,
      newBalance: user.ecoPoints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the logged-in user's redemption history
// @route   GET /api/redemptions/mine
// @access  Private (all roles)
exports.getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user._id })
      .populate('reward', 'name description category pointsCost')
      .sort('-createdAt');
    res.json({ success: true, count: redemptions.length, data: redemptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all redemptions (admin view)
// @route   GET /api/redemptions
// @access  Private (admin only)
exports.getAllRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find()
      .populate('user', 'name email role')
      .populate('reward', 'name category pointsCost')
      .sort('-createdAt');
    res.json({ success: true, count: redemptions.length, data: redemptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update redemption status (admin: Fulfilled / Cancelled)
// @route   PUT /api/redemptions/:id
// @access  Private (admin only)
exports.updateRedemptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Fulfilled', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const redemption = await Redemption.findById(req.params.id);
    if (!redemption) return res.status(404).json({ success: false, message: 'Redemption not found' });
    if (redemption.status === 'Fulfilled') {
      return res.status(400).json({ success: false, message: 'Already fulfilled' });
    }

    // If cancelling, refund the points back to the user
    if (status === 'Cancelled' && redemption.status !== 'Cancelled') {
      await User.findByIdAndUpdate(redemption.user, {
        $inc: { ecoPoints: redemption.pointsSpent },
      });
    }

    redemption.status = status;
    await redemption.save();

    const populated = await Redemption.findById(redemption._id)
      .populate('user', 'name email role')
      .populate('reward', 'name category pointsCost');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
