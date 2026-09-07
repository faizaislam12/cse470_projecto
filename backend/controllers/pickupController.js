const Pickup = require('../models/Pickup');
const Listing = require('../models/Listing'); // assumes Listing model exists (Feature 1)

// Allowed forward transitions for status tracking
const ALLOWED_TRANSITIONS = {
  scheduled: ['confirmed', 'rescheduled', 'cancelled'],
  confirmed: ['en_route', 'rescheduled', 'cancelled'],
  en_route: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * @desc   Feature 6 - Schedule a pickup (household confirms a collector's accepted offer)
 * @route  POST /api/pickups
 * @access Household
 */
exports.schedulePickup = async (req, res) => {
  try {
    const { listingId, collectorId, acceptedOfferId, scheduledDate, timeSlot, address, contactPhone, specialInstructions } = req.body;

    if (!listingId || !collectorId || !scheduledDate || !timeSlot || !address || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Missing required scheduling fields.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    // NOTE: ownership check skipped for demo purposes since auth/req.user is not wired up.
    // Re-enable this once login is added:
    // if (String(listing.household) !== String(req.user._id)) {
    //   return res.status(403).json({ success: false, message: 'Not authorized to schedule pickup for this listing.' });
    // }

    const pickupDate = new Date(scheduledDate);
    if (isNaN(pickupDate.getTime()) || pickupDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Scheduled date must be a valid future date.' });
    }

    const pickup = await Pickup.create({
      listing: listingId,
      household: listing.household,
      collector: collectorId,
      acceptedOffer: acceptedOfferId,
      scheduledDate: pickupDate,
      timeSlot,
      address,
      contactPhone,
      specialInstructions,
      status: 'scheduled',
      statusHistory: [{ status: 'scheduled', changedBy: listing.household, note: 'Pickup created' }],
    });

    listing.status = 'pickup_scheduled';
    await listing.save();

    const populated = await pickup.populate([
      { path: 'household', select: 'name email phone' },
      { path: 'collector', select: 'name email phone' },
      { path: 'listing', select: 'title category quantity' },
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

    if (scheduledDate) pickup.scheduledDate = new Date(scheduledDate);
    if (timeSlot) pickup.timeSlot = timeSlot;
    pickup.status = 'rescheduled';
    pickup.statusHistory.push({
      status: 'rescheduled',
      note: reason || 'Pickup rescheduled',
      changedBy: req.user._id,
    });

    await pickup.save();
    return res.status(200).json({ success: true, data: pickup });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reschedule pickup.', error: err.message });
  }
};

/**
 * @desc   Feature 7 - Update pickup status (collector updates progress)
 * @route  PATCH /api/pickups/:id/status
 * @access Collector (or Admin)
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

    pickup.status = status;
    pickup.statusHistory.push({ status, note, changedBy: req.user._id });

    if (status === 'completed') {
      pickup.completedAt = new Date();
      await Listing.findByIdAndUpdate(pickup.listing, { status: 'completed' });
    }
    if (status === 'cancelled') {
      pickup.cancelledReason = note || 'No reason provided';
      await Listing.findByIdAndUpdate(pickup.listing, { status: 'active' });
    }

    await pickup.save();
    return res.status(200).json({ success: true, data: pickup });
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
      .populate('listing', 'title category quantity')
      .populate('statusHistory.changedBy', 'name role');

    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found.' });

    const isOwner = [String(pickup.household._id), String(pickup.collector._id)].includes(String(req.user._id));
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
 * @route  GET /api/pickups?status=scheduled&role=household
 * @access Household, Collector, Admin
 */
exports.listPickups = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (req.user.role === 'household') filter.household = req.user._id;
    else if (req.user.role === 'collector') filter.collector = req.user._id;
    // admin sees all pickups (no filter on user)

    if (status) filter.status = status;

    const pickups = await Pickup.find(filter)
      .populate('household', 'name phone')
      .populate('collector', 'name phone')
      .populate('listing', 'title category quantity')
      .sort({ scheduledDate: 1 });

    return res.status(200).json({ success: true, count: pickups.length, data: pickups });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list pickups.', error: err.message });
  }
};