const express = require('express');
const { createGoal, getMyGoals, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Order matters: specific paths before parameterized ones
router.get('/mine', protect, getMyGoals);
router.post('/', protect, createGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
