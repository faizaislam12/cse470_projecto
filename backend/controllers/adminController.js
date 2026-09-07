const User = require('../models/User');
const Business = require('../models/Business');
const { Campaign, CampaignParticipant } = require('../models/Campaign');
const Listing = require('../models/Listing');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Feedback = require('../models/Feedback');

const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/**
 * @desc   List all users, optional role & search filters
 * @route  GET /api/admin/users?role=collector&q=...
 * @access admin
 */
exports.listUsers = async (req, res) => {
  try {
    const { role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];

    const users = await User.find(filter, '-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list users.', error: err.message });
  }
};

/**
 * @desc   Update a user's role
 * @route  PATCH /api/admin/users/:id/role
 * @access admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['household', 'collector', 'recycling_company', 'business', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin' && req.params.id === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    user.role = role;
    await user.save();
    return res.status(200).json({ success: true, message: 'User role updated.', data: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.', error: err.message });
  }
};

/**
 * @desc   Admin dashboard analytics computed from real platform data
 * @route  GET /api/admin/analytics
 * @access admin
 */
exports.analytics = async (req, res) => {
  try {
    const monthStart = startOfMonth();
    const now = new Date();

    const [userCount, householdCount, collectorCount, recyclingCompanyCount, adminCount,
      businessCount, listingCount, campaignCount, pickupCount, completedPickups,
      cancelledPickups, completedTx, avgRating] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'household' }),
      User.countDocuments({ role: 'collector' }),
      User.countDocuments({ role: 'recycling_company' }),
      User.countDocuments({ role: 'admin' }),
      Business.countDocuments(),
      Listing.countDocuments(),
      Campaign.countDocuments(),
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: 'completed' }),
      Pickup.countDocuments({ status: 'cancelled' }),
      Transaction.countDocuments({ status: 'Completed' }),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
    ]);

    const completedTxDocs = await Transaction.find({ status: 'Completed' }).select('weight totalAmount pointsEarned category transactionDate createdAt seller buyer');
    const totalWasteKg = completedTxDocs.reduce((s, t) => s + (t.weight || 0), 0);
    const totalRevenue = completedTxDocs.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const ecoPointsIssued = completedTxDocs.reduce((s, t) => s + (t.pointsEarned || 0), 0);
    const thisMonthWaste = completedTxDocs
      .filter((t) => new Date(t.transactionDate || t.createdAt) >= monthStart)
      .reduce((s, t) => s + (t.weight || 0), 0);

    // Waste by material (category)
    const categoryNames = {};
    const cats = await Category.find().select('name');
    cats.forEach((c) => (categoryNames[String(c._id)] = c.name));

    const wasteByMaterial = {};
    completedTxDocs.forEach((t) => {
      const key = categoryNames[String(t.category)] || 'Other';
      wasteByMaterial[key] = (wasteByMaterial[key] || 0) + (t.weight || 0);
    });

    // Monthly totals (last 6 complete months incl. current partial)
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { month: key, transactions: 0, weight: 0, revenue: 0, ecoPoints: 0 };
    }
    completedTxDocs.forEach((t) => {
      const d = new Date(t.transactionDate || t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].transactions += 1;
        monthMap[key].weight += t.weight || 0;
        monthMap[key].revenue += t.totalAmount || 0;
        monthMap[key].ecoPoints += t.pointsEarned || 0;
      }
    });
    const monthlyTrend = Object.values(monthMap);

    // User growth by month (registration)
    const userGrowthRaw = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Role distribution
    const roleDistribution = [
      { role: 'household', label: 'Households', count: householdCount },
      { role: 'collector', label: 'Collectors', count: collectorCount },
      { role: 'recycling_company', label: 'Recycling Companies', count: recyclingCompanyCount },
      { role: 'business', label: 'Businesses', count: businessCount },
      { role: 'admin', label: 'Admins', count: adminCount },
    ];

    // Campaigns with progress
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(10);
    const campaignPerformance = await Promise.all(
      campaigns.map(async (c) => {
        const participants = await CampaignParticipant.countDocuments({ campaignId: c._id });
        return {
          _id: c._id,
          title: c.title,
          status: c.status,
          targetWeight: c.targetWeight || 0,
          currentWeight: c.currentWeight || 0,
          participants,
          progress: c.targetWeight ? Math.min(100, Math.round(((c.currentWeight || 0) / c.targetWeight) * 100)) : 0,
        };
      })
    );

    // Top collectors by completed weight (from completed transactions where they are buyer)
    const collectorMap = {};
    const collectors = await User.find({ role: 'collector' }).select('name email');
    collectors.forEach((c2) => (collectorMap[String(c2._id)] = c2));
    const collectorStats = {};
    completedTxDocs.forEach((t) => {
      const id = String(t.buyer);
      if (!collectorMap[id]) return;
      collectorStats[id] = collectorStats[id] || { user: collectorMap[id], pickups: 0, weight: 0, earnings: 0 };
      collectorStats[id].pickups += 1;
      collectorStats[id].weight += t.weight || 0;
      collectorStats[id].earnings += t.totalAmount || 0;
    });
    const topCollectors = Object.values(collectorStats)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map((c3) => ({ name: c3.user.name, email: c3.user.email, ...c3, user: undefined }));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          users: userCount,
          households: householdCount,
          collectors: collectorCount,
          businesses: businessCount,
          recyclingCompanies: recyclingCompanyCount,
          admins: adminCount,
          listings: listingCount,
          campaigns: campaignCount,
          campaignsActive: await Campaign.countDocuments({ status: 'Active' }),
          pickups: pickupCount,
          completedPickups,
          cancelledPickups,
          transactions: completedTx,
          totalWasteKg: Math.round(totalWasteKg * 100) / 100,
          thisMonthWaste: Math.round(thisMonthWaste * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          ecoPointsIssued: Math.round(ecoPointsIssued),
          avgRating: avgRating.length ? Math.round(avgRating[0].avg * 100) / 100 : 0,
          feedbackCount: avgRating.length ? avgRating[0].count : 0,
          pendingBusinesses: await Business.countDocuments({ status: 'Pending' }),
          verifiedBusinesses: businessCount,
        },
        roleDistribution,
        monthlyTrend,
        userGrowth: userGrowthRaw,
        wasteByMaterial,
        campaignPerformance,
        topCollectors,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compute analytics.', error: err.message });
  }
};