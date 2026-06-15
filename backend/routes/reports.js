const express = require('express');
const router = express.Router();
const {
  createReport,
  trackReport,
  getAllReports,
  updateReportStatus,
  getRecentReports,
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/recent', getRecentReports);
router.get('/track/:reportId', trackReport);
router.post('/', upload.single('photo'), createReport);
router.get('/', protect, adminOnly, getAllReports);
router.patch('/:id/status', protect, adminOnly, updateReportStatus);

module.exports = router;
