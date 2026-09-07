const express = require('express');
const { getTransactions, createTransaction, updateTransactionStatus } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, getTransactions);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransactionStatus);
module.exports = router;
