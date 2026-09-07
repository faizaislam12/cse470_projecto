const express = require('express');
const { getMarketPrices, simulatePriceChanges } = require('../controllers/priceController');
const router = express.Router();
router.get('/', getMarketPrices);
router.post('/simulate', simulatePriceChanges);
module.exports = router;
