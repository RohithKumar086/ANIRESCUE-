const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;
