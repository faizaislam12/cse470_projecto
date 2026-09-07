const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOffer,
  getOffersForListing,
  getMyOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
} = require('../controllers/offerController');
const {
  createCounterOffer,
  acceptCounterOffer,
  rejectCounterOffer,
} = require('../controllers/counterOfferController');

router.get('/my', protect, getMyOffers);
router.post('/', protect, authorize('collector'), createOffer);

router.get('/listing/:listingId', protect, getOffersForListing);
router.put('/:id/accept', protect, acceptOffer);
router.put('/:id/reject', protect, rejectOffer);
router.put('/:id/withdraw', protect, withdrawOffer);

router.post('/:id/counter', protect, authorize('household'), createCounterOffer);
router.put('/:id/counter/:counterIndex/accept', protect, acceptCounterOffer);
router.put('/:id/counter/:counterIndex/reject', protect, rejectCounterOffer);

module.exports = router;