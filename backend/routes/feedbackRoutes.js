const express = require('express');
const { createFeedback, getUserFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/', protect, createFeedback);
router.get('/user/:userId', getUserFeedback);
module.exports = router;
