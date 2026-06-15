const { Reports } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateReportId = () => 'RPT-' + uuidv4().split('-')[0].toUpperCase();

// @desc    Submit a new animal report
// @route   POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { animalType, injuryDescription, address, city, state, pincode, lat, lng, contactNumber, severity } = req.body;

    if (!animalType || !injuryDescription || !address || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Animal type, description, address and contact are required' });
    }

    const reportData = {
      reportId: generateReportId(),
      animalType,
      injuryDescription,
      location: { address, city, state, pincode },
      coordinates: { lat: parseFloat(lat) || null, lng: parseFloat(lng) || null },
      contactNumber,
      severity: severity || 'Medium',
      status: 'Pending',
      statusHistory: [{ status: 'Pending', note: 'Report submitted', updatedAt: new Date() }],
      reportedBy: req.user ? req.user._id : null,
      adminNotes: '',
    };

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      reportData.photo = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const report = await Reports.create(reportData);
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully!',
      reportId: report.reportId,
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track report by reportId
// @route   GET /api/reports/track/:reportId
exports.trackReport = async (req, res) => {
  try {
    const report = await Reports.findOne({ reportId: req.params.reportId.toUpperCase() });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found. Please check the Report ID.' });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (admin)
// @route   GET /api/reports
exports.getAllReports = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const allReports = await Reports.findWithOptions(query, {
      sort: { createdAt: -1 },
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    });

    const total = await Reports.countDocuments(query);
    res.json({ success: true, total, page: parseInt(page), reports: allReports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update report status (admin)
// @route   PATCH /api/reports/:id/status
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes, assignedVolunteer } = req.body;
    const report = await Reports.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const updatedHistory = [
      ...(report.statusHistory || []),
      { status, note: adminNotes || '', updatedAt: new Date() },
    ];

    const updated = await Reports.findByIdAndUpdate(req.params.id, {
      $set: {
        status: status || report.status,
        adminNotes: adminNotes || report.adminNotes,
        assignedVolunteer: assignedVolunteer || report.assignedVolunteer,
        statusHistory: updatedHistory,
      },
    });

    res.json({ success: true, message: 'Status updated', report: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent rescued reports (public)
// @route   GET /api/reports/recent
exports.getRecentReports = async (req, res) => {
  try {
    const reports = await Reports.findWithOptions(
      { status: { $in: ['Rescued', 'Completed'] } },
      { sort: { updatedAt: -1 }, limit: 6 }
    );
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
