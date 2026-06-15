const { Shelters } = require('../config/db');

// @desc    Get all shelters
// @route   GET /api/shelters
exports.getShelters = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 50 } = req.query;
    // In NeDB, $ne false matches docs where field is true OR field doesn't exist
    let query = {};

    if (city) query.city = new RegExp(city, 'i');
    if (search) {
      // NeDB supports regex for simple text search
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ];
    }

    const shelters = await Shelters.findWithOptions(query, {
      sort: { rating: -1 },
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    });

    const total = await Shelters.countDocuments(query);
    res.json({ success: true, total, shelters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single shelter
// @route   GET /api/shelters/:id
exports.getShelter = async (req, res) => {
  try {
    const shelter = await Shelters.findById(req.params.id);
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });
    res.json({ success: true, shelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create shelter (admin)
// @route   POST /api/shelters
exports.createShelter = async (req, res) => {
  try {
    const shelter = await Shelters.create(req.body);
    res.status(201).json({ success: true, message: 'Shelter added successfully', shelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update shelter (admin)
// @route   PUT /api/shelters/:id
exports.updateShelter = async (req, res) => {
  try {
    const shelter = await Shelters.findByIdAndUpdate(req.params.id, { $set: req.body });
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });
    res.json({ success: true, shelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft-delete shelter (admin)
// @route   DELETE /api/shelters/:id
exports.deleteShelter = async (req, res) => {
  try {
    await Shelters.findByIdAndUpdate(req.params.id, { $set: { isActive: false } });
    res.json({ success: true, message: 'Shelter removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
