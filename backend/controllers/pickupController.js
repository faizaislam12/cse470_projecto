const Pickup = require('../models/Pickup');
const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const ALLOWED_TRANSITIONS = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['en_route', 'cancelled'],
  en_route: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * @desc   Feature 6 - Schedule a pickup for an accepted offer
 * @route  POST /api/pickups
 * @access Household (listing owner) or Collector of the accepted offer
 */
exports.schedulePickup = async (req, res) => {
  try {
    const { offerId, scheduledDate, timeSlot, address, contactPhone, specialInstructions } = req.body;

    if (!offerId || !scheduledDate || !timeSlot || !address || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Missing required scheduling fields.' });
    }

    const offer = await Offer.findById(offerId).populate('listing');
    if (!offer || !offer.listing) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    if (offer.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Pickup can only be scheduled for an accepted offer.' });
    }

    const listing = offer.listing;
    const householdId = listing.owner;
    const collectorId = offer.collector;

    const isHousehold = String(householdId) === String(req.user._id);
    const isCollector = String(collectorId) === String(req.user._id);
    if (!isHousehold && !isCollector && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule this pickup.' });
    }

    const pickup = await Pickup.create({
      listing: listing._id,
      household: householdId,
      collector: collectorId,
      acceptedOffer: offer._id,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      address,
      contactPhone,
      specialInstructions,
      status: 'scheduled',
      statusHistory: [{ status: 'scheduled', changedBy: req.user._id, note: 'Pickup created' }],
    });

    await Listing.findByIdAndUpdate(listing._id, { status: 'Pending' });

    const populated = await pickup.populate([
      { path: 'household', select: 'name email phone' },
      { path: 'collector', select: 'name email phone' },
      { path: 'listing', select: 'title weight unit price' },
    ]);

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to schedule pickup.', error: err.message });
  }
};

/**
 * @desc   Feature 6 - Reschedule an existing pickup
 * @route  PATCH /api/pickups/:id/reschedule
 * @access Household or Collector (whoever owns the pickup)
 */
exports.reschedulePickup = async (req, res) => {
  try {
    const { scheduledDate, timeSlot, reason } = req.body;
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found.' });

    const isOwner = [String(pickup.household), String(pickup.collector)].includes(String(req.user._id));
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this pickup.' });
    }

    if (['completed', 'cancelled'].includes(pickup.status)) {
      return res.status(400).json({ success: false, message: `Cannot reschedule a ${pickup.status} pickup.` });
    }

    const update = { $set: {}, $push: { statusHistory: { status: 'rescheduled', note: reason || 'Pickup rescheduled', changedBy: req.user._id } } };
    if (scheduledDate) update.$set.scheduledDate = new Date(scheduledDate);
    if (timeSlot) update.$set.timeSlot = timeSlot;
    update.$set.status = 'rescheduled';

    const updated = await Pickup.findByIdAndUpdate(pickup._id, update, { runValidators: true, new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reschedule pickup.', error: err.message });
  }
};

/**
 * @desc   Feature 7 - Update pickup status (collector or admin updates progress)
 * @route  PATCH /api/pickups/:id/status
 * @access Collector (assigned) or Admin
 */
exports.updatePickupStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found.' });

    const isCollector = String(pickup.collector) === String(req.user._id);
    if (!isCollector && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the assigned collector can update pickup status.' });
    }

    const allowedNext = ALLOWED_TRANSITIONS[pickup.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${pickup.status}' to '${status}'.`,
        allowedNext,
      });
    }

    const update = { $set: {}, $push: { statusHistory: { status, note, changedBy: req.user._id } } };
    update.$set.status = status;

    if (status === 'completed') {
      update.$set.completedAt = new Date();

      const listing = await Listing.findById(pickup.listing).populate('category');
      const existingTx = await Transaction.findOne({ listing: pickup.listing, status: 'Completed' });

      if (listing && !existingTx) {
        const offer = pickup.acceptedOffer ? await Offer.findById(pickup.acceptedOffer) : null;
        const points = Math.round((listing.category?.defaultPointsPerKg || 10) * listing.weight);
        const amount = offer?.offerPrice || listing.price || 0;

        await Transaction.create({
          listing: listing._id,
          seller: pickup.household,
          buyer: pickup.collector,
          category: listing.category?._id,
          weight: listing.weight,
          unit: listing.unit,
          totalAmount: amount,
          offeredAmount: amount,
          pointsEarned: points,
          status: 'Completed',
          scheduledDate: pickup.scheduledDate,
          history: [{ action: 'Completed', actor: req.user._id, amount, date: new Date() }],
          transactionDate: new Date(),
        });

        const [seller, buyer] = await Promise.all([
          User.findById(pickup.household),
          User.findById(pickup.collector),
        ]);
        if (seller) { seller.ecoPoints = (seller.ecoPoints || 0) + points; await seller.save(); }
        if (buyer) { buyer.ecoPoints = (buyer.ecoPoints || 0) + points; await buyer.save(); }
      }

      await Listing.findByIdAndUpdate(pickup.listing, { status: 'Completed' });
    }
    if (status === 'cancelled') {
      update.$set.cancelledReason = note || 'No reason provided';
      await Listing.findByIdAndUpdate(pickup.listing, { status: 'Available' });
    }

    const updated = await Pickup.findByIdAndUpdate(pickup._id, update, { runValidators: true, new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update pickup status.', error: err.message });
  }
};

/**
 * @desc   Feature 7 - Get a single pickup with full status history (tracking view)
 * @route  GET /api/pickups/:id
 * @access Household, Collector (owners), Admin
 */
exports.getPickupTracking = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('household', 'name phone')
      .populate('collector', 'name phone')
      .populate('listing', 'title weight unit price');

    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found.' });

    const isOwner = [String(pickup.household?._id), String(pickup.collector?._id)].includes(String(req.user._id));
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this pickup.' });
    }

    return res.status(200).json({ success: true, data: pickup });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pickup.', error: err.message });
  }
};

/**
 * @desc   Feature 6/7 - List pickups for the logged-in user, filterable by status
 * @route  GET /api/pickups?status=scheduled
 * @access Household, Collector, Admin
 */
exports.listPickups = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (req.user.role === 'household') filter.household = req.user._id;
    else if (req.user.role === 'collector') filter.collector = req.user._id;

    if (status) filter.status = status;

    const pickups = await Pickup.find(filter)
      .populate('household', 'name phone')
      .populate('collector', 'name phone')
      .populate('listing', 'title weight unit price')
      .sort({ scheduledDate: 1 });

    return res.status(200).json({ success: true, count: pickups.length, data: pickups });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list pickups.', error: err.message });
  }
};