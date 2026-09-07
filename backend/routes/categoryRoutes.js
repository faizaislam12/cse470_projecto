const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', getCategories);
router.post('/', protect, authorize('admin'), createCategory);
module.exports = router;
