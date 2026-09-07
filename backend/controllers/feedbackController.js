const Feedback = require('../models/Feedback');
const Transaction = require('../models/Transaction');

exports.createFeedback = async (req, res) => {
  const { transactionId, rating, comment } = req.body;
  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (tx.status !== 'Completed') return res.status(400).json({ success: false, message: 'Only completed transactions can be reviewed' });
    const reviewer = req.user._id.toString();
    const reviewee = tx.seller.toString() === reviewer ? tx.buyer : tx.seller;
    if (![tx.seller.toString(), tx.buyer.toString()].includes(reviewer))
      return res.status(400).json({ success: false, message: 'Not a participant' });
    const exists = await Feedback.findOne({ transaction: transactionId, reviewer });
    if (exists) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const fb = await Feedback.create({ transaction: transactionId, listing: tx.listing, reviewer, reviewee, rating, comment });
    const populated = await Feedback.findById(fb._id).populate('reviewer', 'name role').populate('reviewee', 'name role');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getUserFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ reviewee: req.params.userId }).populate('reviewer', 'name role').sort('-createdAt');
    const total = feedbacks.reduce((a, c) => a + c.rating, 0);
    const avg = feedbacks.length > 0 ? (total / feedbacks.length).toFixed(1) : 0;
    res.json({ success: true, count: feedbacks.length, averageRating: parseFloat(avg), data: feedbacks });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
