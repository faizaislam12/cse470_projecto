const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { listUsers, updateUserRole, analytics } = require('../controllers/adminController');
const { collectorOverview } = require('../controllers/collectorController');

router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/analytics', analytics);
router.get('/collectors', collectorOverview);

module.exports = router;