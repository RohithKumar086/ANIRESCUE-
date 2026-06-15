import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FaPaw, FaHeart, FaUsers, FaHome, FaSmile,
  FaExclamationTriangle, FaRobot, FaHandsHelping,
  FaSearch, FaArrowRight, FaStar, FaShieldAlt
} from 'react-icons/fa';
import { MdPets, MdEmergency, MdVolunteerActivism } from 'react-icons/md';

const STATS = [
  { label: 'Animals Rescued', value: '12,540+', icon: FaPaw, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'Active Volunteers', value: '3,200+', icon: FaUsers, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Shelters Registered', value: '480+', icon: FaHome, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Successful Adoptions', value: '8,100+', icon: FaSmile, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const FEATURES = [
  {
    icon: MdEmergency,
    title: 'Emergency Reporting',
    desc: 'Report injured animals instantly with GPS location, photo upload, and severity assessment. Generate a unique tracking ID.',
    link: '/report',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/10',
  },
  {
    icon: FaRobot,
    title: 'AI Rescue Assistant',
    desc: 'Get real-time, expert animal rescue guidance powered by Google Gemini AI. First aid, handling, and vet recommendations.',
    link: '/report',
    color: 'text-primary-600',
    bg: 'bg-primary-50 dark:bg-primary-900/10',
  },
  {
    icon: FaSearch,
    title: 'Find Nearby Shelters',
    desc: 'Locate animal shelters across India with interactive maps. Filter by city, capacity, and animal type.',
    link: '/shelters',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
  },
  {
    icon: FaHeart,
    title: 'Adoption Guidance',
    desc: 'Complete adoption support including readiness assessment, checklists, vaccination schedules, and care guides.',
    link: '/adoption',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/10',
  },
  {
    icon: MdVolunteerActivism,
    title: 'Volunteer Network',
    desc: 'Join thousands of animal welfare volunteers. Register your skills and availability to help rescue operations.',
    link: '/volunteer',
    color: 'text-accent-500',
    bg: 'bg-orange-50 dark:bg-orange-900/10',
  },
  {
    icon: FaShieldAlt,
    title: 'Report Tracking',
    desc: 'Track the status of your animal rescue report in real-time, from submission to rescue completion.',
    link: '/track',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/10',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Bangalore',
    text: 'Found an injured stray dog on the street. AniRescue connected me with a volunteer within 20 minutes. The dog was rescued and treated!',
    rating: 5,
    emoji: '🐕',
  },
  {
    name: 'Rahul Mehta',
    city: 'Mumbai',
    text: 'The AI chatbot guided me through first aid for an injured bird until professional help arrived. Incredible service!',
    rating: 5,
    emoji: '🐦',
  },
  {
    name: 'Ananya Krishnan',
    city: 'Chennai',
    text: 'Adopted my cat through this platform. The adoption readiness quiz was so helpful for a first-time pet owner like me.',
    rating: 5,
    emoji: '🐈',
  },
];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const numTarget = parseInt(target.replace(/[^0-9]/g, ''));
  const suffix = target.replace(/[0-9]/g, '').replace(',', '');

  useEffect(() => {
    let start = 0;
    const step = numTarget / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numTarget, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
}



export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center relative pt-20 overflow-hidden">

        {/* ── Wind-blown leaf photo background ─────────── */}
        {/* Layer 1: base photo, slow gentle sway left-right */}
        <div className="absolute inset-0 wind-layer-1" />
        {/* Layer 2: slightly faster subtle counter-sway */}
        <div className="absolute inset-0 wind-layer-2" />
        {/* Layer 3: slow zoom breathe for depth */}
        <div className="absolute inset-0 wind-layer-3" />

        {/* ── Dark overlay for text readability ─────────── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70 z-10" />

        {/* ── Main Hero Content ────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 text-green-300 text-sm font-semibold px-5 py-2.5 rounded-full mb-8 shadow-lg"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              🇮🇳 India's Premier Animal Rescue Platform
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-tight mb-6 tracking-tight"
            >
              Every Animal{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Deserves</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M0 8 Q75 0 150 8 Q225 16 300 8" stroke="url(#underlineGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="underlineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="50%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-green-300">
                a Second Chance
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Report injured animals, find shelters, get AI-powered rescue guidance,
              and connect with volunteers — all in one platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-12"
            >
              <Link to="/report"
                className="group flex items-center gap-2.5 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl shadow-red-500/40 transition-all hover:-translate-y-1.5 hover:shadow-red-500/60 active:scale-95">
                <MdEmergency size={22} className="group-hover:animate-pulse" />
                Report Injured Animal
              </Link>
              <Link to="/ai-assistant"
                className="group flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl shadow-primary-500/40 transition-all hover:-translate-y-1.5 active:scale-95">
                <FaRobot size={18} className="group-hover:rotate-12 transition-transform" />
                Talk to AI Assistant
              </Link>
              <Link to="/volunteer"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg border border-white/30 hover:border-white/50 backdrop-blur-sm transition-all hover:-translate-y-1.5 active:scale-95">
                <FaHandsHelping size={18} />
                Become a Volunteer
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 text-sm"
            >
              {[
                { icon: '🔒', text: 'Secure Platform' },
                { icon: '📱', text: 'Mobile Friendly' },
                { icon: '🤖', text: 'AI Powered' },
                { icon: '🆓', text: 'Free to Use' },
                { icon: '🇮🇳', text: 'Pan-India' },
              ].map((badge) => (
                <span key={badge.text}
                  className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm border border-white/15 text-gray-300 px-4 py-2 rounded-full hover:bg-white/15 transition-colors">
                  {badge.icon} {badge.text}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900 relative -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`${stat.bg} rounded-2xl p-6 text-center card-hover`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
                <p className="text-3xl font-display font-black text-gray-900 dark:text-white">
                  {statsVisible ? <AnimatedCounter target={stat.value} /> : '0'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to <span className="gradient-text">Save Lives</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A comprehensive platform designed to make animal rescue faster, smarter, and more effective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={f.link}
                  className="block bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover h-full"
                >
                  <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <f.icon className={`${f.color} text-2xl`} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${f.color}`}>
                    Learn more <FaArrowRight size={12} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Rescue made simple in 4 steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📍', title: 'Spot & Report', desc: 'See an injured animal? Report it instantly with location, photo, and severity level.' },
              { step: '02', icon: '🤖', title: 'AI Guidance', desc: 'Get immediate AI-powered first aid instructions while rescue is on the way.' },
              { step: '03', icon: '🦺', title: 'Volunteer Responds', desc: 'A trained volunteer or rescue team is dispatched to your location.' },
              { step: '04', icon: '💚', title: 'Animal Rescued', desc: 'The animal receives care at a shelter and gets a chance at adoption.' },
            ].map((step, i) => (
              <div key={step.step} className="text-center relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100 dark:from-primary-800 dark:to-primary-900" />
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-primary-500/20 relative z-10">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">Step {step.step}</span>
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stories That <span className="gradient-text">Inspire</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xl">Real stories from our community members</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover"
              >
                <div className="text-4xl mb-4">{t.emoji}</div>
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <FaStar key={j} className="text-yellow-400" size={14} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute text-6xl"
              style={{ left: `${i * 10}%`, top: `${Math.random() * 100}%` }}>🐾</div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            Be the Change. Save a Life Today.
          </h2>
          <p className="text-primary-100 text-xl mb-10">
            Join thousands of animal welfare champions making India a safer place for animals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/report" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-1 shadow-xl">
              🆘 Report Now
            </Link>
            <Link to="/volunteer" className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-1 shadow-xl">
              💪 Volunteer
            </Link>
            <Link to="/adoption" className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-2xl text-lg border border-white/30 transition-all hover:-translate-y-1">
              ❤️ Adopt a Pet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
