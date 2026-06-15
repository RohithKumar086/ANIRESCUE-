const express = require('express');
const router = express.Router();
const {
  registerVolunteer,
  getVolunteers,
  updateVolunteerStatus,
} = require('../controllers/volunteerController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', registerVolunteer);
router.get('/', protect, adminOnly, getVolunteers);
router.patch('/:id/status', protect, adminOnly, updateVolunteerStatus);

module.exports = router;
