const MarketPrice = require('../models/MarketPrice');

exports.getMarketPrices = async (req, res) => {
  try {
    const prices = await MarketPrice.find().populate('category');
    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.simulatePriceChanges = async (req, res) => {
  try {
    const prices = await MarketPrice.find().populate('category');
    for (let p of prices) {
      const change = (Math.random() * 20 - 10) / 100;
      p.priceHistory.push({ price: p.currentPrice, date: new Date() });
      p.currentPrice = Math.max(0.05, Math.round(p.currentPrice * (1 + change) * 100) / 100);
      p.trend = change > 0.02 ? 'Up' : change < -0.02 ? 'Down' : 'Stable';
      await p.save();
    }
    const updated = await MarketPrice.find().populate('category');
    res.json({ success: true, data: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
