const Listing = require('../models/Listing'); // assumes Listing model exists (Feature 1)

/**
 * @desc   Feature 3 - Browse marketplace of available recyclable listings
 * @route  GET /api/listings/marketplace?category=plastic&city=Dhaka&minQuantity=5&sort=newest&page=1&limit=12
 * @access Collector, Recycling Company
 */
exports.getMarketplaceListings = async (req, res) => {
  try {
    const {
      category,
      city,
      minQuantity,
      maxQuantity,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Only show listings that are open for offers — sold/completed/pickup-scheduled listings don't belong in the marketplace
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (city) filter['address.city'] = new RegExp(`^${city}$`, 'i');

    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = Number(minQuantity);
      if (maxQuantity) filter.quantity.$lte = Number(maxQuantity);
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      quantity_high: { quantity: -1 },
      quantity_low: { quantity: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('household', 'name city rating')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: listings,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load marketplace listings.', error: err.message });
  }
};

/**
 * @desc   Feature 3 - Get distinct material categories present in active listings (for filter dropdown)
 * @route  GET /api/listings/marketplace/categories
 * @access Collector, Recycling Company
 */
exports.getMarketplaceCategories = async (req, res) => {
  try {
    const categories = await Listing.distinct('category', { status: 'active' });
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load categories.', error: err.message });
  }
};

/**
 * @desc   Feature 3 - Get single listing detail from the marketplace
 * @route  GET /api/listings/marketplace/:id
 * @access Collector, Recycling Company
 */
exports.getMarketplaceListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('household', 'name city rating phone');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    if (listing.status !== 'active') {
      return res.status(410).json({ success: false, message: 'This listing is no longer available.' });
    }

    return res.status(200).json({ success: true, data: listing });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load listing.', error: err.message });
  }
};