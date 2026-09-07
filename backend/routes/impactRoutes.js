const express = require('express');
const { getMyImpact } = require('../controllers/impactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyImpact);

module.exports = router;
