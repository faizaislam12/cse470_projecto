const User = require('../models/User');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');

const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/**
 * @desc   Admin overview of all collectors' performance
 * @route  GET /api/admin/collectors
 * @access admin
 */
exports.collectorOverview = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'collector' }).select('name email ecoPoints createdAt');

    const stats = await Promise.all(
      collectors.map(async (c) => {
        const [total, completed, cancelled, inProgress, tx, monthTx] = await Promise.all([
          Pickup.countDocuments({ collector: c._id }),
          Pickup.countDocuments({ collector: c._id, status: 'completed' }),
          Pickup.countDocuments({ collector: c._id, status: 'cancelled' }),
          Pickup.countDocuments({ collector: c._id, status: { $in: ['scheduled', 'confirmed', 'en_route', 'in_progress', 'rescheduled'] } }),
          Transaction.find({ buyer: c._id, status: 'Completed' }).select('weight totalAmount transactionDate createdAt'),
          Transaction.find({ buyer: c._id, status: 'Completed', transactionDate: { $gte: startOfMonth() } }).select('_id'),
        ]);

        const weight = tx.reduce((s, t) => s + (t.weight || 0), 0);
        const revenue = tx.reduce((s, t) => s + (t.totalAmount || 0), 0);

        return {
          user: { _id: c._id, name: c.name, email: c.email, ecoPoints: c.ecoPoints, createdAt: c.createdAt },
          totalPickups: total,
          completedPickups: completed,
          cancelledPickups: cancelled,
          inProgress,
          successRate: total ? Math.round((completed / total) * 100) : 0,
          totalWeight: Math.round(weight * 100) / 100,
          totalEarnings: Math.round(revenue * 100) / 100,
          thisMonthPickups: monthTx.length,
        };
      })
    );

    stats.sort((a, b) => b.totalWeight - a.totalWeight || b.completedPickups - a.completedPickups);
    return res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compute collector overview.', error: err.message });
  }
};

/**
 * @desc   A collector's own performance dashboard
 * @route  GET /api/collectors/me
 * @access collector
 */
exports.myPerformance = async (req, res) => {
  try {
    const me = req.user;
    const monthStart = startOfMonth();

    const [total, completed, cancelled, inProgress, tx, completedDocs] = await Promise.all([
      Pickup.countDocuments({ collector: me._id }),
      Pickup.countDocuments({ collector: me._id, status: 'completed' }),
      Pickup.countDocuments({ collector: me._id, status: 'cancelled' }),
      Pickup.countDocuments({ collector: me._id, status: { $in: ['scheduled', 'confirmed', 'en_route', 'in_progress', 'rescheduled'] } }),
      Transaction.find({ buyer: me._id, status: 'Completed' }),
      Pickup.find({ collector: me._id, status: 'completed' }).populate({
        path: 'listing',
        select: 'weight title category',
        populate: { path: 'category', select: 'name' },
      }),
    ]);

    const weight = tx.reduce((s, t) => s + (t.weight || 0), 0);
    const revenue = tx.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const ecoPoints = tx.reduce((s, t) => s + (t.pointsEarned || 0), 0);
    const thisMonthTx = tx.filter((t) => new Date(t.transactionDate || t.createdAt) >= monthStart);
    const thisMonthWaste = thisMonthTx.reduce((s, t) => s + (t.weight || 0), 0);
    const thisMonthEarnings = thisMonthTx.reduce((s, t) => s + (t.totalAmount || 0), 0);

    // Waste by material from completed pickups
    const wasteByMaterial = {};
    completedDocs.forEach((p) => {
      const key = p.listing?.category?.name || 'Other';
      wasteByMaterial[key] = (wasteByMaterial[key] || 0) + (p.listing?.weight || 0);
    });

    // Recent activity
    const recent = await Pickup.find({ collector: me._id })
      .populate('listing', 'title weight')
      .sort({ updatedAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        name: me.name,
        email: me.email,
        ecoPoints: me.ecoPoints,
        totals: {
          totalPickups: total,
          completedPickups: completed,
          cancelledPickups: cancelled,
          inProgress,
          successRate: total ? Math.round((completed / total) * 100) : 0,
          totalWeight: Math.round(weight * 100) / 100,
          totalEarnings: Math.round(revenue * 100) / 100,
          ecoPointsEarned: Math.round(ecoPoints),
        },
        thisMonth: {
          pickups: thisMonthTx.length,
          weight: Math.round(thisMonthWaste * 100) / 100,
          earnings: Math.round(thisMonthEarnings * 100) / 100,
        },
        wasteByMaterial,
        recent,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compute performance.', error: err.message });
  }
};