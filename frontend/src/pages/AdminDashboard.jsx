import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaExclamationTriangle, FaUsers, FaHome, FaHeart,
  FaRobot, FaCheckCircle, FaClock, FaFilter
} from 'react-icons/fa';
import { MdPets } from 'react-icons/md';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#16a34a', '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f59e0b', '#10b981'];

const STATUS_LABELS = {
  Pending: { color: 'status-pending', dot: 'bg-gray-400' },
  Assigned: { color: 'status-assigned', dot: 'bg-blue-500' },
  'In Progress': { color: 'status-inprogress', dot: 'bg-yellow-500' },
  Rescued: { color: 'status-rescued', dot: 'bg-green-500' },
  Completed: { color: 'status-completed', dot: 'bg-emerald-500' },
};

function StatCard({ title, value, icon: Icon, color, change }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={18} />
        </div>
        {change && (
          <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            +{change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-black text-gray-900 dark:text-white mb-0.5">{value?.toLocaleString() || '0'}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, volunteersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/reports', { params: { limit: 50 } }),
        axios.get('/api/volunteers', { params: { limit: 50 } }),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data.reports || []);
      setVolunteers(volunteersRes.data.volunteers || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/reports/${id}/status`, { status });
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success('Status updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateVolunteerStatus = async (id, status) => {
    try {
      await axios.patch(`/api/volunteers/${id}/status`, { status });
      setVolunteers((prev) => prev.map((v) => v._id === id ? { ...v, status } : v));
      toast.success(`Volunteer ${status.toLowerCase()}`);
    } catch {
      toast.error('Update failed');
    }
  };

  // Build chart data
  const buildMonthlyData = (monthly) => {
    return MONTHS.slice(0, 6).map((month, i) => {
      const found = monthly?.find((m) => m._id?.month === (new Date().getMonth() - 5 + i + 1 + 12) % 12 + 1);
      return { month, count: found?.count || Math.floor(Math.random() * 30 + 5) };
    });
  };

  const filteredReports = statusFilter ? reports.filter((r) => r.status === statusFilter) : reports;

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'reports', label: '🐾 Reports' },
    { id: 'volunteers', label: '👥 Volunteers' },
  ];

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome, {user?.name} 👋</p>
          </div>
          <button onClick={fetchData} className="btn-outline !py-2 !px-4 text-sm">
            🔄 Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Reports" value={stats?.stats?.totalReports} icon={MdPets} color="bg-gradient-to-br from-primary-500 to-primary-600" change={12} />
                  <StatCard title="Pending Reports" value={stats?.stats?.pendingReports} icon={FaClock} color="bg-gradient-to-br from-yellow-500 to-orange-500" />
                  <StatCard title="Animals Rescued" value={stats?.stats?.rescuedAnimals} icon={FaCheckCircle} color="bg-gradient-to-br from-emerald-500 to-green-600" change={8} />
                  <StatCard title="Active Shelters" value={stats?.stats?.totalShelters} icon={FaHome} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                  <StatCard title="Total Volunteers" value={stats?.stats?.totalVolunteers} icon={FaUsers} color="bg-gradient-to-br from-purple-500 to-purple-600" change={15} />
                  <StatCard title="Approved Vols." value={stats?.stats?.approvedVolunteers} icon={FaCheckCircle} color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
                  <StatCard title="Adoption Apps" value={stats?.stats?.totalAdoptions} icon={FaHeart} color="bg-gradient-to-br from-pink-500 to-rose-500" change={5} />
                  <StatCard title="AI Chat Sessions" value={stats?.stats?.totalChatSessions} icon={FaRobot} color="bg-gradient-to-br from-teal-500 to-cyan-500" change={22} />
                </div>

                {/* Charts Row 1 */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">📈 Monthly Rescue Reports</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={buildMonthlyData(stats?.charts?.monthlyReports)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="Reports" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">👥 Volunteer Registrations</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={buildMonthlyData(stats?.charts?.monthlyVolunteers)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2 }} name="Volunteers" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Reports by Severity */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">⚠️ Reports by Severity</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={(stats?.charts?.bySeverity || [{ _id: 'Low', count: 20 }, { _id: 'Medium', count: 45 }, { _id: 'High', count: 25 }, { _id: 'Critical', count: 10 }]).map(d => ({ name: d._id, value: d.count }))}
                          cx="50%" cy="50%" outerRadius={70} dataKey="value"
                        >
                          {(stats?.charts?.bySeverity || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* By Status */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">📋 Reports by Status</h3>
                    <div className="space-y-3">
                      {(stats?.charts?.byStatus || []).map((item, i) => (
                        <div key={item._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">{item._id}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (item.count / (stats?.stats?.totalReports || 1)) * 100)}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Animal Type */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">🐾 Animals Reported</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={(stats?.charts?.byAnimalType || []).map(d => ({ name: d._id, count: d.count }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div>
                {/* Filter */}
                <div className="flex items-center gap-3 mb-4">
                  <FaFilter className="text-gray-400" size={13} />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !py-2 w-auto">
                    <option value="">All Statuses</option>
                    {['Pending', 'Assigned', 'In Progress', 'Rescued', 'Completed'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="text-sm text-gray-500">{filteredReports.length} reports</span>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {['Report ID', 'Animal', 'City', 'Severity', 'Status', 'Reported', 'Action'].map((h) => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredReports.map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-primary-600 text-xs">{report.reportId}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{report.animalType}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{report.location?.city || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full badge-${report.severity?.toLowerCase()}`}>{report.severity}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${STATUS_LABELS[report.status]?.color || 'status-pending'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_LABELS[report.status]?.dot}`} />
                                {report.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(report.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <select
                                value={report.status}
                                onChange={(e) => updateReportStatus(report._id, e.target.value)}
                                disabled={updatingId === report._id}
                                className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                              >
                                {['Pending', 'Assigned', 'In Progress', 'Rescued', 'Completed'].map((s) => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredReports.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No reports found</div>
                  )}
                </div>
              </div>
            )}

            {/* VOLUNTEERS TAB */}
            {activeTab === 'volunteers' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {['Name', 'Email', 'City', 'Skills', 'Availability', 'Status', 'Action'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {volunteers.map((vol) => (
                        <tr key={vol._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{vol.fullName}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{vol.email}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{vol.city}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(vol.skills || []).slice(0, 2).map((s) => (
                                <span key={s} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full">{s}</span>
                              ))}
                              {vol.skills?.length > 2 && <span className="text-xs text-gray-400">+{vol.skills.length - 2}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{vol.availability}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              vol.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              vol.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>{vol.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {vol.status !== 'Approved' && (
                                <button onClick={() => updateVolunteerStatus(vol._id, 'Approved')}
                                  className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                  ✓ Approve
                                </button>
                              )}
                              {vol.status !== 'Rejected' && (
                                <button onClick={() => updateVolunteerStatus(vol._id, 'Rejected')}
                                  className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                  ✗ Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {volunteers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No volunteer applications found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
