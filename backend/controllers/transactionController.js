const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const User = require('../models/User');

exports.getTransactions = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} :
      ['household', 'business'].includes(req.user.role) ? { seller: req.user._id } : { buyer: req.user._id };
    const txs = await Transaction.find(query)
      .populate('listing').populate('seller', 'name email role ecoPoints')
      .populate('buyer', 'name email role ecoPoints').populate('category').sort('-createdAt');
    res.json({ success: true, count: txs.length, data: txs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createTransaction = async (req, res) => {
  try {
    const { listingId, offeredAmount } = req.body;
    const listing = await Listing.findById(listingId).populate('category');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'Available' && listing.status !== 'available') return res.status(400).json({ success: false, message: 'Listing not available' });
    if (listing.owner.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot claim your own listing' });
    
    const points = Math.round((listing.category.defaultPointsPerKg || 10) * listing.weight);
    const amount = offeredAmount || listing.price;
    const status = offeredAmount ? 'Negotiating' : 'Pending';
    
    let tx;
    try {
      tx = await Transaction.create({
        listing: listing._id, seller: listing.owner, buyer: req.user._id,
        category: listing.category._id, weight: listing.weight, unit: listing.unit,
        totalAmount: listing.price, offeredAmount: amount, pointsEarned: points, status,
        history: [{ action: offeredAmount ? 'Offer' : 'Claim', actor: req.user._id, amount }]
      });
    } catch (txError) {
      return res.status(500).json({ success: false, message: txError.message });
    }
    
    try {
      listing.status = 'Pending';
      await listing.save();
    } catch (listingError) {
      await Transaction.findByIdAndDelete(tx._id);
      return res.status(500).json({ success: false, message: listingError.message });
    }
    
    const populated = await Transaction.findById(tx._id)
      .populate('listing').populate('seller', 'name email role ecoPoints')
      .populate('buyer', 'name email role ecoPoints').populate('category');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateTransactionStatus = async (req, res) => {
  const { status, offeredAmount, scheduledDate } = req.body;
  if (!['Pending', 'Negotiating', 'Scheduled', 'Completed', 'Cancelled'].includes(status)) 
    return res.status(400).json({ success: false, message: 'Invalid status' });
    
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    const allowed = [tx.buyer.toString(), tx.seller.toString()];
    if (!allowed.includes(req.user._id.toString()) && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
      
    if (['Completed', 'Cancelled'].includes(tx.status)) return res.status(400).json({ success: false, message: `Already ${tx.status}` });
    
    tx.status = status;
    if (offeredAmount) {
      tx.offeredAmount = offeredAmount;
      tx.history.push({ action: 'Counter', actor: req.user._id, amount: offeredAmount });
    }
    if (scheduledDate) {
      tx.scheduledDate = scheduledDate;
      tx.history.push({ action: 'Schedule', actor: req.user._id, date: new Date() });
    }
    if (status === 'Completed' || status === 'Cancelled') {
      tx.history.push({ action: status, actor: req.user._id, date: new Date() });
    }
    
    await tx.save();
    
    const listing = await Listing.findById(tx.listing);
    if (listing) { 
      listing.status = status === 'Completed' ? 'Completed' : (status === 'Cancelled' ? 'Available' : 'Pending'); 
      await listing.save(); 
    }
    
    if (status === 'Completed') {
      const seller = await User.findById(tx.seller);
      if (seller) { seller.ecoPoints = (seller.ecoPoints || 0) + tx.pointsEarned; await seller.save(); }
      
      const buyer = await User.findById(tx.buyer);
      if (buyer) { buyer.ecoPoints = (buyer.ecoPoints || 0) + tx.pointsEarned; await buyer.save(); }
    }
    
    const populated = await Transaction.findById(tx._id)
      .populate('listing').populate('seller', 'name email role ecoPoints')
      .populate('buyer', 'name email role ecoPoints').populate('category');
    res.json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
