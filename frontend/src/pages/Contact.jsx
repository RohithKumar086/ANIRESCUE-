import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-3">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl">We're here to help animals and their rescuers</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: FaPhone, title: '24/7 Helpline', info: '1800-XXX-XXXX', sub: 'For animal emergencies', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { icon: FaWhatsapp, title: 'WhatsApp', info: '+91-9XXXXXXXXX', sub: 'Quick responses', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: FaEnvelope, title: 'Email', info: 'help@anirescue.org', sub: 'Response within 24 hrs', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: FaMapMarkerAlt, title: 'Office', info: 'Pan India Network', sub: '50+ cities covered', color: 'text-accent-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { icon: FaClock, title: 'Office Hours', info: 'Mon-Sat 9AM-7PM', sub: 'Emergency line 24/7', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={item.color} size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item.info}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5 h-fit">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Send us a Message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Your Name</label>
                <input value={form.name} onChange={(e) => setForm(f => ({...f,name:e.target.value}))} required placeholder="Full Name" className="input-field" />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({...f,email:e.target.value}))} required placeholder="your@email.com" className="input-field" />
              </div>
            </div>
            <div>
              <label className="input-label">Subject</label>
              <select value={form.subject} onChange={(e) => setForm(f => ({...f,subject:e.target.value}))} required className="input-field">
                <option value="">Select a subject</option>
                <option>Emergency Animal Rescue</option>
                <option>Shelter Information</option>
                <option>Volunteer Inquiry</option>
                <option>Adoption Help</option>
                <option>Report a Problem</option>
                <option>Partnership Inquiry</option>
                <option>General Feedback</option>
              </select>
            </div>
            <div>
              <label className="input-label">Message</label>
              <textarea value={form.message} onChange={(e) => setForm(f => ({...f,message:e.target.value}))} required rows={5} placeholder="Describe your inquiry in detail..." className="input-field resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4">
              {loading ? '⏳ Sending...' : '📨 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
