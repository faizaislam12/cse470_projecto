const express = require('express');
const router = express.Router();

const {
  getMarketplaceListings,
  getMarketplaceCategories,
  getMarketplaceListingById,
} = require('../controllers/marketplaceController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Feature 3: Collector Marketplace
router.get('/', getMarketplaceListings);
router.get('/categories', getMarketplaceCategories);
router.get('/:id', getMarketplaceListingById);

module.exports = router;

// In server.js / app.js:
// const marketplaceRoutes = require('./routes/marketplaceRoutes');
// app.use('/api/listings/marketplace', marketplaceRoutes);