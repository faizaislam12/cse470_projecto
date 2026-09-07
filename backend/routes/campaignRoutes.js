const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  listCampaigns,
  getCampaign,
  joinCampaign,
  leaveCampaign,
  contribute,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
} = require('../controllers/campaignController');

router.get('/', protect, listCampaigns);
router.get('/:id', protect, getCampaign);
router.post('/:id/join', protect, joinCampaign);
router.post('/:id/leave', protect, leaveCampaign);
router.patch('/:id/contribute', protect, contribute);

router.post('/', protect, authorize('admin'), createCampaign);
router.patch('/:id', protect, authorize('admin'), updateCampaign);
router.patch('/:id/status', protect, authorize('admin'), updateCampaignStatus);
router.delete('/:id', protect, authorize('admin'), deleteCampaign);

module.exports = router;