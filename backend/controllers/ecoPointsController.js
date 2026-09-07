const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// @desc    Get the logged-in user's EcoPoints balance, history, and category breakdown
// @route   GET /api/ecopoints/me
// @access  Private (all roles)
exports.getMyEcoPoints = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all completed transactions where the user was buyer or seller
    const completedTransactions = await Transaction.find({
      status: 'Completed',
      $or: [{ seller: userId }, { buyer: userId }],
    })
      .populate('listing', 'title')
      .populate('category', 'name icon defaultPointsPerKg')
      .populate('seller', 'name')
      .populate('buyer', 'name')
      .sort('-transactionDate');

    // Aggregate total points earned from completed transactions
    const totalEarned = completedTransactions.reduce(
      (sum, tx) => sum + (tx.pointsEarned || 0),
      0
    );

    // Break down points earned by category
    const categoryBreakdown = {};
    completedTransactions.forEach((tx) => {
      const catName = tx.category?.name || 'Uncategorized';
      const catIcon = tx.category?.icon || 'recycle';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = { name: catName, icon: catIcon, points: 0, transactions: 0 };
      }
      categoryBreakdown[catName].points += tx.pointsEarned || 0;
      categoryBreakdown[catName].transactions += 1;
    });

    // Format history for the frontend
    const history = completedTransactions.map((tx) => {
      const isSeller = tx.seller?._id?.toString() === userId.toString();
      return {
        id: tx._id,
        listingTitle: tx.listing?.title || 'Unknown Listing',
        category: tx.category?.name || 'Uncategorized',
        categoryIcon: tx.category?.icon || 'recycle',
        pointsEarned: tx.pointsEarned || 0,
        weight: tx.weight,
        unit: tx.unit,
        role: isSeller ? 'Seller' : 'Collector',
        counterparty: isSeller ? tx.buyer?.name : tx.seller?.name,
        date: tx.transactionDate || tx.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        currentBalance: req.user.ecoPoints || 0,
        totalEarned,
        totalTransactions: completedTransactions.length,
        averagePerTransaction:
          completedTransactions.length > 0
            ? Math.round(totalEarned / completedTransactions.length)
            : 0,
        categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.points - a.points),
        history,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the top 10 EcoPoints earners (leaderboard)
// @route   GET /api/ecopoints/leaderboard
// @access  Private (all roles)
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .select('name role ecoPoints')
      .sort({ ecoPoints: -1 })
      .limit(10);

    const currentUserId = req.user._id.toString();

    const leaderboard = topUsers.map((u, index) => ({
      rank: index + 1,
      name: u.name,
      role: u.role,
      ecoPoints: u.ecoPoints || 0,
      isCurrentUser: u._id.toString() === currentUserId,
    }));

    // Check if current user is in top 10; if not, append their rank
    const userInTop10 = leaderboard.some((entry) => entry.isCurrentUser);
    let currentUserRank = null;

    if (!userInTop10) {
      const rank = await User.countDocuments({
        isActive: true,
        ecoPoints: { $gt: req.user.ecoPoints || 0 },
      });
      currentUserRank = {
        rank: rank + 1,
        name: req.user.name,
        role: req.user.role,
        ecoPoints: req.user.ecoPoints || 0,
        isCurrentUser: true,
      };
    }

    res.json({
      success: true,
      data: { leaderboard, currentUserRank },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories with their points-per-kg earning rates
// @route   GET /api/ecopoints/rates
// @access  Private (all roles)
exports.getPointRates = async (req, res) => {
  try {
    const categories = await Category.find().select('name icon defaultPointsPerKg defaultPricePerKg').sort('name');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
