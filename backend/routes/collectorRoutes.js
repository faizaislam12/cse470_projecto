const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { myPerformance } = require('../controllers/collectorController');

router.get('/me', protect, authorize('collector'), myPerformance);

module.exports = router;