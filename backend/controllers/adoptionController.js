const { Adoptions } = require('../config/db');

// @desc    Submit adoption application
// @route   POST /api/adoptions
exports.submitAdoption = async (req, res) => {
  try {
    const adoption = await Adoptions.create({ ...req.body, status: 'Pending' });
    res.status(201).json({
      success: true,
      message: 'Adoption application submitted! We will contact you soon.',
      adoption,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all adoption applications (admin)
// @route   GET /api/adoptions
exports.getAdoptions = async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const adoptions = await Adoptions.findWithOptions(query, { sort: { createdAt: -1 } });
    res.json({ success: true, count: adoptions.length, adoptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update adoption status (admin)
// @route   PATCH /api/adoptions/:id/status
exports.updateAdoptionStatus = async (req, res) => {
  try {
    const adoption = await Adoptions.findByIdAndUpdate(req.params.id, {
      $set: { status: req.body.status, notes: req.body.notes },
    });
    if (!adoption) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
