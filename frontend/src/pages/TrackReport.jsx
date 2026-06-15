import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearch, FaCheckCircle, FaClock, FaUser } from 'react-icons/fa';
import { MdPets } from 'react-icons/md';

const STATUS_STEPS = ['Pending', 'Assigned', 'In Progress', 'Rescued', 'Completed'];
const STATUS_COLORS = {
  Pending: 'bg-gray-400',
  Assigned: 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  Rescued: 'bg-green-500',
  Completed: 'bg-emerald-500',
};
const SEVERITY_COLORS = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
  Critical: 'badge-critical',
};

export default function TrackReport() {
  const [searchParams] = useSearchParams();
  const [reportId, setReportId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('id')) handleTrack();
  }, []);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!reportId.trim()) return toast.error('Please enter a report ID');
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const { data } = await axios.get(`/api/reports/track/${reportId.trim().toUpperCase()}`);
      setReport(data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Report not found');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = report ? STATUS_STEPS.indexOf(report.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-3">
            Track Your <span className="gradient-text">Report</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your unique Report ID to see the rescue status
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrack} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
          <label className="input-label">Report ID</label>
          <div className="flex gap-3">
            <input
              value={reportId}
              onChange={(e) => setReportId(e.target.value.toUpperCase())}
              placeholder="e.g. RPT-A1B2C3D4"
              className="input-field flex-1 font-mono tracking-wider text-lg"
            />
            <button type="submit" disabled={loading}
              className="btn-primary flex items-center gap-2 shrink-0 !py-3">
              <FaSearch size={14} />
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-center text-red-600 dark:text-red-400">
            ❌ {error}
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Report ID</p>
                  <p className="text-2xl font-display font-black text-primary-600 tracking-wider">{report.reportId}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${SEVERITY_COLORS[report.severity]}`}>
                  {report.severity} Severity
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Animal Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{report.animalType}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Reported On</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(report.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Location</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{report.location?.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Current Status</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[report.status]} text-white`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    {report.status}
                  </span>
                </div>
              </div>
              {report.injuryDescription && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-gray-500 text-sm mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.injuryDescription}</p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Rescue Progress</h3>
              <div className="space-y-0">
                {STATUS_STEPS.map((status, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isPending = i > currentStepIndex;
                  return (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isCompleted ? 'bg-primary-500 text-white' :
                          isCurrent ? `${STATUS_COLORS[status]} text-white ring-4 ring-offset-2 ring-primary-200 dark:ring-primary-900` :
                          'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}>
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 min-h-[2rem] transition-colors ${isCompleted ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <p className={`font-semibold ${isCurrent ? 'text-gray-900 dark:text-white' : isPending ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {status}
                          {isCurrent && <span className="ml-2 text-xs text-primary-500 animate-pulse font-bold">● CURRENT</span>}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Last updated: {new Date(report.updatedAt).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Volunteer */}
            {report.assignedVolunteer && (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Assigned Volunteer</p>
                    <p className="font-bold text-gray-900 dark:text-white">{report.assignedVolunteer.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.assignedVolunteer.city} · {report.assignedVolunteer.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Photo */}
            {report.photo && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <img src={report.photo} alt="Reported animal" className="w-full h-64 object-cover" />
                <p className="text-center text-sm text-gray-500 py-3">Submitted photo</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
