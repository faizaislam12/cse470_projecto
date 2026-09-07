const express = require('express');
const { getMyCertificates, getCertificateById } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/mine', protect, getMyCertificates);
router.get('/:id', protect, getCertificateById);

module.exports = router;
