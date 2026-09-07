const Listing = require('../models/Listing');
const Category = require('../models/Category');

exports.getListings = async (req, res) => {
  try {
    let query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    } else if (!req.query.status) {
      query.status = 'Available'; // Only default if not explicitly asking for All
    }
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
    const listings = await Listing.find(query).populate('category').populate('owner', 'name email role ecoPoints').sort('-createdAt');
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).populate('category').sort('-createdAt');
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('category').populate('owner', 'name email role ecoPoints');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createListing = async (req, res) => {
  try {
    const { title, description, category, weight, unit, price, address, image } = req.body;
    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ success: false, message: 'Invalid category' });
    const listing = await Listing.create({ title, description, category, weight, unit: unit || 'kg', price, address, image: image || '', owner: req.user._id });
    const populated = await Listing.findById(listing._id).populate('category');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category');
    res.json({ success: true, data: listing });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing removed' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
