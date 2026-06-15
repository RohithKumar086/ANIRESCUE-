const express = require('express');
const router = express.Router();
const {
  getShelters,
  getShelter,
  createShelter,
  updateShelter,
  deleteShelter,
} = require('../controllers/shelterController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getShelters);
router.get('/:id', getShelter);
router.post('/', protect, adminOnly, createShelter);
router.put('/:id', protect, adminOnly, updateShelter);
router.delete('/:id', protect, adminOnly, deleteShelter);

module.exports = router;
