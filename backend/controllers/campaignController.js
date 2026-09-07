const { Campaign, CampaignParticipant } = require('../models/Campaign');
const Notification = require('../models/Notification');
const User = require('../models/User');

/* ---------------- helpers ---------------- */

const notifyAllUsers = (title, message, type, relatedId) =>
  User.find().then((users) =>
    Notification.insertMany(
      users.map((u) => ({ user: u._id, title, message, type: type || 'CAMPAIGN', relatedId: relatedId || null }))
    )
  );

const recalcCurrentWeight = (campaignId) =>
  CampaignParticipant.aggregate([
    { $match: { campaignId } },
    { $group: { _id: null, total: { $sum: '$contributionKg' } } },
  ]).then((rows) => (rows.length ? rows[0].total : 0));

/* ---------------- public / participant ---------------- */

/**
 * @desc   List all campaigns (optionally filter by status)
 * @route  GET /api/campaigns
 * @access any authenticated user
 */
exports.listCampaigns = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list campaigns.', error: err.message });
  }
};

/**
 * @desc   Get a single campaign with its participants
 * @route  GET /api/campaigns/:id
 * @access any authenticated user
 */
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    const participants = await CampaignParticipant.find({ campaignId: campaign._id }).lean();
    return res.status(200).json({ success: true, data: { ...campaign.toObject(), participants } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch campaign.', error: err.message });
  }
};

/**
 * @desc   User joins a campaign
 * @route  POST /api/campaigns/:id/join
 * @access any authenticated user
 */
exports.joinCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const exists = await CampaignParticipant.findOne({ campaignId: campaign._id, user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'You already joined this campaign.' });

    const participant = await CampaignParticipant.create({
      campaignId: campaign._id,
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isSponsor: req.user.role === 'business' || req.user.role === 'recycling_company',
      contributionKg: 0,
    });

    return res.status(201).json({ success: true, message: 'Joined campaign.', data: participant });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to join campaign.', error: err.message });
  }
};

/**
 * @desc   User leaves a campaign
 * @route  POST /api/campaigns/:id/leave
 * @access any authenticated user
 */
exports.leaveCampaign = async (req, res) => {
  try {
    const participant = await CampaignParticipant.findOneAndDelete({
      campaignId: req.params.id,
      user: req.user._id,
    });
    if (!participant) return res.status(404).json({ success: false, message: 'You are not a participant.' });

    const weight = await recalcCurrentWeight(req.params.id);
    await Campaign.findByIdAndUpdate(req.params.id, { currentWeight: Math.round(weight * 100) / 100 });
    return res.status(200).json({ success: true, message: 'Left campaign.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to leave campaign.', error: err.message });
  }
};

/**
 * @desc   Participant logs a contribution to the campaign
 * @route  PATCH /api/campaigns/:id/contribute
 * @access any authenticated participant
 */
exports.contribute = async (req, res) => {
  try {
    const { contributionKg } = req.body;
    const kg = Number(contributionKg);
    if (!kg || kg <= 0) return res.status(400).json({ success: false, message: 'Contribution must be positive.' });

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const participant = await CampaignParticipant.findOne({ campaignId: campaign._id, user: req.user._id });
    if (!participant) return res.status(404).json({ success: false, message: 'Join the campaign first.' });

    participant.contributionKg += kg;
    await participant.save();

    const weight = await recalcCurrentWeight(campaign._id);
    campaign.currentWeight = Math.round(weight * 100) / 100;
    await campaign.save();

    return res.status(200).json({ success: true, message: 'Contribution recorded.', data: participant });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record contribution.', error: err.message });
  }
};

/* ---------------- admin ---------------- */

/**
 * @desc   Create a campaign and notify all users
 * @route  POST /api/campaigns
 * @access admin
 */
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, image, startDate, endDate, targetWeight, status } = req.body;
    const campaign = await Campaign.create({
      title,
      description,
      image,
      startDate,
      endDate,
      targetWeight,
      status: status || 'Upcoming',
      createdBy: req.user._id,
      currentWeight: 0,
    });

    await notifyAllUsers(
      'New Recycling Campaign',
      `A new campaign "${title}" has been launched. Join and help us reach ${targetWeight || 0} kg!`,
      'CAMPAIGN',
      campaign._id
    );

    return res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create campaign.', error: err.message });
  }
};

/**
 * @desc   Update campaign details
 * @route  PATCH /api/campaigns/:id
 * @access admin
 */
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    return res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update campaign.', error: err.message });
  }
};

/**
 * @desc   Change campaign status + notify all participants
 * @route  PATCH /api/campaigns/:id/status
 * @access admin
 */
exports.updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Upcoming', 'Active', 'Ended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const participants = await CampaignParticipant.find({ campaignId: campaign._id }).distinct('user');
    await Notification.insertMany(
      participants.map((u) => ({
        user: u,
        title: 'Campaign Status Update',
        message: `Campaign "${campaign.title}" is now ${status}.`,
        type: 'CAMPAIGN',
        relatedId: campaign._id,
      }))
    );

    return res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update campaign status.', error: err.message });
  }
};

/**
 * @desc   Delete a campaign
 * @route  DELETE /api/campaigns/:id
 * @access admin
 */
exports.deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    await CampaignParticipant.deleteMany({ campaignId: req.params.id });
    return res.status(200).json({ success: true, message: 'Campaign deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete campaign.', error: err.message });
  }
};