const Business = require('../models/Business');
const Notification = require('../models/Notification');

const notifyUser = (user, title, message, type, relatedId) =>
  Notification.create({ user, title, message, type: type || 'SYSTEM', relatedId: relatedId || null });

/**
 * @desc   Get the business profile for a given user
 * @route  GET /api/businesses/user/:userId
 * @access Business (own / platform check), Admin
 */
exports.getBusinessByUserId = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.params.userId });
    if (!business) return res.status(404).json({ success: false, message: 'No business profile found.' });
    const allowed =
      req.user.role === 'admin' ||
      (req.user.role === 'business' && String(business.user) === String(req.user._id));
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized.' });
    return res.status(200).json({ success: true, data: business });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch business.', error: err.message });
  }
};

/**
 * @desc   Create / upsert the logged-in business user's profile
 * @route  POST /api/businesses/profile
 * @access business
 */
exports.createBusinessProfile = async (req, res) => {
  try {
    const { businessName, businessType, phone, address, logo, description } = req.body;
    let business = await Business.findOne({ user: req.user._id });

    if (business) {
      business.businessName = businessName || business.businessName;
      business.businessType = businessType || business.businessType;
      business.phone = phone || business.phone;
      business.address = address || business.address;
      if (logo !== undefined) business.logo = logo;
      business.description = description !== undefined ? description : business.description;
      await business.save();
      return res.status(200).json({ success: true, message: 'Business profile updated.', data: business });
    }

    business = await Business.create({
      user: req.user._id,
      businessName,
      businessType,
      phone,
      address,
      logo,
      description,
      status: 'Pending',
    });
    return res.status(201).json({ success: true, message: 'Business profile created.', data: business });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save business.', error: err.message });
  }
};

/**
 * @desc   List all business profiles
 * @route  GET /api/businesses
 * @access admin
 */
exports.listBusinesses = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const businesses = await Business.find(filter)
      .populate('user', 'name email ecoPoints createdAt')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list businesses.', error: err.message });
  }
};

/**
 * @desc   Admin updates business verification status + notifies the owner
 * @route  PATCH /api/businesses/:id/status
 * @access admin
 */
exports.updateBusinessStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' });

    business.status = status;
    await business.save();

    const verb = status === 'Approved' ? 'approved' : status.toLowerCase() + 'd';
    await notifyUser(
      business.user,
      'Business Status Updated',
      `Your business "${business.businessName}" has been ${verb}.`,
      'SYSTEM',
      business._id
    );

    return res.status(200).json({ success: true, data: business });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update business status.', error: err.message });
  }
};

/**
 * @desc   Admin deletes a business profile
 * @route  DELETE /api/businesses/:id
 * @access admin
 */
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' });
    return res.status(200).json({ success: true, message: 'Business deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete business.', error: err.message });
  }
};