const express = require('express');
const router = express.Router();
const {
  submitAdoption,
  getAdoptions,
  updateAdoptionStatus,
} = require('../controllers/adoptionController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', submitAdoption);
router.get('/', protect, adminOnly, getAdoptions);
router.patch('/:id/status', protect, adminOnly, updateAdoptionStatus);

module.exports = router;
