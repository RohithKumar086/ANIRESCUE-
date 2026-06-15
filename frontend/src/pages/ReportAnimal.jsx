import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaCamera, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { MdPets, MdEmergency } from 'react-icons/md';

const ANIMAL_TYPES = ['Dog', 'Cat', 'Bird', 'Cow', 'Horse', 'Monkey', 'Snake', 'Other'];
const SEVERITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-400', desc: 'Minor injury, mobile' },
  { value: 'Medium', label: 'Medium', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20', dot: 'bg-yellow-400', desc: 'Injured, needs care' },
  { value: 'High', label: 'High', color: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20', dot: 'bg-orange-400', desc: 'Serious injury' },
  { value: 'Critical', label: 'Critical', color: 'border-red-500 bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500', desc: 'Life-threatening' },
];

export default function ReportAnimal() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({
    animalType: '',
    injuryDescription: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    lat: '',
    lng: '',
    contactNumber: '',
    severity: 'Medium',
  });

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setGpsLoading(false);
        toast.success('GPS location captured!');
      },
      () => {
        setGpsLoading(false);
        toast.error('Could not get GPS location. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const { data } = await axios.post('/api/reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReportId(data.reportId);
      setSubmitted(true);
      toast.success('Report submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Report Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            A volunteer has been notified. Track your report using the ID below.
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Report ID</p>
            <p className="text-3xl font-display font-black text-primary-600 tracking-wider">{reportId}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(reportId); toast.success('Report ID copied!'); }}
              className="flex items-center gap-2 text-sm text-primary-600 font-medium mt-3 mx-auto hover:underline"
            >
              <FaCopy size={12} /> Copy ID
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <a href={`/track?id=${reportId}`} className="btn-primary text-center">Track This Report</a>
            <button onClick={() => { setSubmitted(false); setStep(1); setForm({ animalType:'',injuryDescription:'',address:'',city:'',state:'',pincode:'',lat:'',lng:'',contactNumber:'',severity:'Medium' }); setPhoto(null); setPhotoPreview(null); }}
              className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
              Submit Another Report
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MdEmergency size={16} /> Emergency Animal Report
          </div>
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-3">
            Report an <span className="gradient-text">Injured Animal</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below. A volunteer will respond as soon as possible.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-10">
          {[{ n: 1, label: 'Animal Info' }, { n: 2, label: 'Location' }, { n: 3, label: 'Contact & Photo' }].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 shrink-0 ${step >= s.n ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.n ? 'bg-primary-600 text-white' : step === s.n ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.n ? 'text-primary-600' : 'text-gray-400'}`}>{s.label}</span>
              </button>
              {i < 2 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s.n ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Animal Info */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div>
                  <label className="input-label">Animal Type *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ANIMAL_TYPES.map((type) => (
                      <button type="button" key={type}
                        onClick={() => setForm((f) => ({ ...f, animalType: type }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-medium ${
                          form.animalType === type
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                        }`}>
                        {type === 'Dog' ? '🐕' : type === 'Cat' ? '🐈' : type === 'Bird' ? '🐦' : type === 'Cow' ? '🐄' : type === 'Horse' ? '🐴' : type === 'Monkey' ? '🐒' : type === 'Snake' ? '🐍' : '🐾'}<br />{type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Injury Description *</label>
                  <textarea name="injuryDescription" value={form.injuryDescription} onChange={handleChange} required
                    rows={4} placeholder="Describe the animal's condition, visible injuries, behavior..."
                    className="input-field resize-none" />
                </div>

                <div>
                  <label className="input-label">Severity Level *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SEVERITY_OPTIONS.map((s) => (
                      <button type="button" key={s.value}
                        onClick={() => setForm((f) => ({ ...f, severity: s.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.severity === s.value ? s.color + ' border-opacity-100' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{s.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => { if (!form.animalType || !form.injuryDescription) { toast.error('Please fill in all required fields'); return; } setStep(2); }}
                  className="w-full btn-primary">
                  Next: Location →
                </button>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                <div>
                  <label className="input-label">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} required
                    placeholder="House No, Street, Area..."
                    className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">State</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" className="input-field" />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="input-label mb-0">GPS Coordinates (Optional)</label>
                    <button type="button" onClick={getGPS} disabled={gpsLoading}
                      className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline disabled:opacity-50">
                      <FaMapMarkerAlt size={12} />
                      {gpsLoading ? 'Getting location...' : 'Use My Location'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="lat" value={form.lat} onChange={handleChange} placeholder="Latitude" className="input-field" />
                    <input name="lng" value={form.lng} onChange={handleChange} placeholder="Longitude" className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-outline">← Back</button>
                  <button type="button" onClick={() => { if (!form.address || !form.city) { toast.error('Please enter address and city'); return; } setStep(3); }}
                    className="flex-1 btn-primary">Next: Contact →</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact & Photo */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div>
                  <label className="input-label">Contact Number *</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required
                    placeholder="+91 XXXXX XXXXX" type="tel" className="input-field" />
                </div>

                <div>
                  <label className="input-label">Upload Animal Photo</label>
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                  }`}>
                    <input {...getInputProps()} />
                    {photoPreview ? (
                      <div>
                        <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-3" />
                        <p className="text-sm text-gray-500">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <FaCamera className="text-gray-400 text-4xl mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Drop a photo here or click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">Max 5MB · JPEG, PNG, WebP</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 space-y-2 text-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Report Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                    <span>Animal:</span> <span className="font-medium text-gray-900 dark:text-white">{form.animalType}</span>
                    <span>Severity:</span> <span className={`font-bold ${form.severity === 'Critical' ? 'text-red-500' : form.severity === 'High' ? 'text-orange-500' : form.severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500'}`}>{form.severity}</span>
                    <span>Location:</span> <span className="font-medium text-gray-900 dark:text-white">{form.city}, {form.state}</span>
                    <span>Photo:</span> <span className="font-medium text-gray-900 dark:text-white">{photo ? '✅ Attached' : '⚠️ None'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 btn-outline">← Back</button>
                  <button type="submit" disabled={loading} className="flex-1 btn-accent disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? '⏳ Submitting...' : '🚨 Submit Report'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
