const Transaction = require('../models/Transaction');

// Shared aggregation used by the Impact Dashboard, Goals, and Certificates
// features so all three read the same completed-transaction data as EcoPoints
// (ecoPointsController.getMyEcoPoints) instead of each re-deriving it.
async function getUserImpactStats(userId, { from, to, category } = {}) {
  const match = {
    status: 'Completed',
    $or: [{ seller: userId }, { buyer: userId }],
  };
  if (from || to) {
    match.transactionDate = {};
    if (from) match.transactionDate.$gte = new Date(from);
    if (to) match.transactionDate.$lte = new Date(to);
  }
  if (category) match.category = category;

  const transactions = await Transaction.find(match).populate('category', 'name icon');

  let totalWeight = 0;
  let totalPoints = 0;
  const categoryBreakdown = {};
  const monthlyMap = {};

  transactions.forEach((tx) => {
    totalWeight += tx.weight || 0;
    totalPoints += tx.pointsEarned || 0;

    const catName = tx.category?.name || 'Uncategorized';
    if (!categoryBreakdown[catName]) {
      categoryBreakdown[catName] = { name: catName, icon: tx.category?.icon || 'recycle', weight: 0 };
    }
    categoryBreakdown[catName].weight += tx.weight || 0;

    const date = tx.transactionDate || tx.createdAt;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + (tx.weight || 0);
  });

  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, weight]) => ({ month, weight: Math.round(weight * 100) / 100 }));

  return {
    totalWeight: Math.round(totalWeight * 100) / 100,
    totalPoints,
    totalTransactions: transactions.length,
    categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.weight - a.weight),
    monthlyTrend,
  };
}

module.exports = { getUserImpactStats };
