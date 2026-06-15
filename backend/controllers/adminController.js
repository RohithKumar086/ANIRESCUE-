const { Reports, Shelters, Volunteers, Adoptions, ChatLogs, Users } = require('../config/db');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Parallel count queries
    const [
      totalReports, rescuedAnimals, pendingReports,
      totalShelters, totalVolunteers, approvedVolunteers,
      totalAdoptions, totalUsers, totalChatSessions,
      allReports, allVolunteers,
    ] = await Promise.all([
      Reports.countDocuments({}),
      Reports.countDocuments({ status: { $in: ['Rescued', 'Completed'] } }),
      Reports.countDocuments({ status: 'Pending' }),
      Shelters.countDocuments({ isActive: { $ne: false } }),
      Volunteers.countDocuments({}),
      Volunteers.countDocuments({ status: 'Approved' }),
      Adoptions.countDocuments({}),
      Users.countDocuments({}),
      ChatLogs.countDocuments({}),
      Reports.find({}),
      Volunteers.find({}),
    ]);

    // ── Build monthly chart data (last 6 months) ──────────────
    const now = new Date();
    const monthlyReports = [];
    const monthlyVolunteers = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const m = date.getMonth();

      const rCount = allReports.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m && d.getFullYear() === year;
      }).length;

      const vCount = allVolunteers.filter((v) => {
        const d = new Date(v.createdAt);
        return d.getMonth() === m && d.getFullYear() === year;
      }).length;

      monthlyReports.push({ month, count: rCount });
      monthlyVolunteers.push({ month, count: vCount });
    }

    // ── Reports by severity ──────────────────────────────────
    const severityMap = {};
    allReports.forEach((r) => {
      severityMap[r.severity] = (severityMap[r.severity] || 0) + 1;
    });
    const bySeverity = Object.entries(severityMap).map(([_id, count]) => ({ _id, count }));

    // ── Reports by status ────────────────────────────────────
    const statusMap = {};
    allReports.forEach((r) => {
      statusMap[r.status] = (statusMap[r.status] || 0) + 1;
    });
    const byStatus = Object.entries(statusMap).map(([_id, count]) => ({ _id, count }));

    // ── Reports by animal type ────────────────────────────────
    const typeMap = {};
    allReports.forEach((r) => {
      typeMap[r.animalType] = (typeMap[r.animalType] || 0) + 1;
    });
    const byAnimalType = Object.entries(typeMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalReports, rescuedAnimals, pendingReports,
        totalShelters, totalVolunteers, approvedVolunteers,
        totalAdoptions, totalUsers, totalChatSessions,
      },
      charts: { monthlyReports, monthlyVolunteers, bySeverity, byStatus, byAnimalType },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const [recentReports, recentVolunteers] = await Promise.all([
      Reports.findWithOptions({}, { sort: { updatedAt: -1 }, limit: 5 }),
      Volunteers.findWithOptions({}, { sort: { createdAt: -1 }, limit: 5 }),
    ]);
    res.json({ success: true, recentReports, recentVolunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
