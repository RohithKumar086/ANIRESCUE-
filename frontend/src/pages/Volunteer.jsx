import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaUsers, FaHeart } from 'react-icons/fa';
import { MdVolunteerActivism } from 'react-icons/md';

const SKILLS_OPTIONS = ['Animal Handling', 'First Aid', 'Transportation', 'Veterinary', 'Photography', 'Social Media', 'Fundraising', 'Foster Care', 'Other'];
const BENEFITS = [
  { icon: '🐾', title: 'Save Lives', desc: 'Directly help rescue and rehabilitate injured animals.' },
  { icon: '🤝', title: 'Community', desc: 'Join a network of passionate animal welfare champions.' },
  { icon: '📜', title: 'Certification', desc: 'Get certified volunteer credentials and training.' },
  { icon: '🌱', title: 'Make Impact', desc: 'Create real, measurable social impact in your community.' },
];

const initialForm = {
  fullName: '', email: '', phone: '', city: '', state: '',
  skills: [], availability: '', experience: '', bio: '',
};

export default function Volunteer() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skills.length === 0) return toast.error('Please select at least one skill');
    setLoading(true);
    try {
      await axios.post('/api/volunteers', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">Application Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your interest in volunteering! Our team will review your application and contact you within 2-3 business days.
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-6 text-sm text-primary-700 dark:text-primary-300">
            📧 A confirmation email has been sent to <strong>{form.email}</strong>
          </div>
          <button onClick={() => { setSubmitted(false); setForm(initialForm); }} className="btn-primary w-full">
            Submit Another Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MdVolunteerActivism size={16} /> Join Our Volunteer Network
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Become a <span className="gradient-text">Volunteer</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of animal welfare champions. Make a real difference in animals' lives.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 card-hover">
              <div className="text-3xl mb-2">{b.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{b.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaUsers className="text-primary-500" /> Volunteer Registration Form
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your full name" className="input-field" />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="input-field" />
            </div>
            <div>
              <label className="input-label">Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className="input-field" />
            </div>
            <div>
              <label className="input-label">City *</label>
              <input name="city" value={form.city} onChange={handleChange} required placeholder="Your city" className="input-field" />
            </div>
            <div>
              <label className="input-label">State</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="Your state" className="input-field" />
            </div>
            <div>
              <label className="input-label">Experience Level *</label>
              <select name="experience" value={form.experience} onChange={handleChange} required className="input-field">
                <option value="">Select experience</option>
                <option>No Experience</option>
                <option>&lt; 1 Year</option>
                <option>1-3 Years</option>
                <option>3+ Years</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Availability *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Weekdays', 'Weekends', 'Both', 'Emergency Only'].map((opt) => (
                  <button type="button" key={opt}
                    onClick={() => setForm((f) => ({ ...f, availability: opt }))}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.availability === opt
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Skills * <span className="font-normal text-gray-400">(Select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map((skill) => (
                  <button type="button" key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.skills.includes(skill)
                        ? 'border-accent-500 bg-orange-50 dark:bg-orange-900/20 text-accent-600 dark:text-accent-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-accent-300'
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">About You / Motivation</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                placeholder="Tell us why you want to volunteer and any relevant experience..."
                className="input-field resize-none" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button type="submit" disabled={loading} className="w-full btn-accent py-4 text-lg font-bold disabled:opacity-60">
              {loading ? '⏳ Submitting...' : '🐾 Submit Volunteer Application'}
            </button>
            <p className="text-center text-sm text-gray-400 mt-3">
              By submitting, you agree to our volunteer terms and code of conduct.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
