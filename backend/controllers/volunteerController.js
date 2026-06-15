const { Volunteers } = require('../config/db');

// @desc    Register as volunteer
// @route   POST /api/volunteers
exports.registerVolunteer = async (req, res) => {
  try {
    const { fullName, email, phone, city, skills, availability, experience, bio, state } = req.body;

    const existing = await Volunteers.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already registered as a volunteer.' });
    }

    const volunteer = await Volunteers.create({
      fullName, email: email?.toLowerCase(), phone, city, state,
      skills: skills || [], availability, experience, bio,
      status: 'Pending', totalRescues: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer registration submitted! Our team will review your application.',
      volunteer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all volunteers (admin)
// @route   GET /api/volunteers
exports.getVolunteers = async (req, res) => {
  try {
    const { status, city, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (city) query.city = new RegExp(city, 'i');

    const volunteers = await Volunteers.findWithOptions(query, {
      sort: { createdAt: -1 },
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    });

    const total = await Volunteers.countDocuments(query);
    res.json({ success: true, total, volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update volunteer status (admin)
// @route   PATCH /api/volunteers/:id/status
exports.updateVolunteerStatus = async (req, res) => {
  try {
    const volunteer = await Volunteers.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } });
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({ success: true, message: `Volunteer ${req.body.status.toLowerCase()}`, volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
