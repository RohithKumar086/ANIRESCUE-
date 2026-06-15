import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaPaw } from 'react-icons/fa';

const ADOPTION_STEPS = [
  { icon: '🔍', title: 'Research & Choose', desc: 'Research different breeds and animal types to find the best match for your lifestyle.' },
  { icon: '📋', title: 'Complete Application', desc: 'Fill out the adoption application form with your living situation and experience.' },
  { icon: '🤝', title: 'Meet & Greet', desc: 'Visit the shelter and meet potential pets to find your perfect companion.' },
  { icon: '🏠', title: 'Home Visit', desc: 'A shelter representative may visit your home to ensure it\'s a safe environment.' },
  { icon: '✅', title: 'Approval', desc: 'Receive approval and finalize adoption paperwork and fees.' },
  { icon: '❤️', title: 'Welcome Home!', desc: 'Bring your new family member home and begin your journey together!' },
];

const CHECKLIST = [
  { category: '🏠 Home Preparation', items: ['Pet-proof the home', 'Remove toxic plants', 'Secure trash bins', 'Create a safe space/bed', 'Buy food and water bowls'] },
  { category: '💊 Health & Wellness', items: ['Schedule first vet visit', 'Plan vaccination schedule', 'Discuss spay/neuter options', 'Get flea/tick prevention', 'Consider pet insurance'] },
  { category: '🍖 Nutrition', items: ['Buy age-appropriate food', 'Establish feeding schedule', 'Fresh water always available', 'Learn about toxic foods', 'Plan healthy treats'] },
  { category: '🎮 Enrichment', items: ['Buy interactive toys', 'Plan exercise routine', 'Mental stimulation activities', 'Socialization plan', 'Training classes'] },
];

const QUIZ_QUESTIONS = [
  {
    id: 'livingSpace',
    question: 'What is your living situation?',
    options: [
      { label: '🏠 Own house with yard', score: 25 },
      { label: '🏢 Apartment (large)', score: 20 },
      { label: '🏠 Apartment (small)', score: 10 },
      { label: '🏨 Shared accommodation', score: 5 },
    ],
  },
  {
    id: 'familySupport',
    question: 'Does your family/household support getting a pet?',
    options: [
      { label: '💯 Everyone is excited!', score: 25 },
      { label: '👍 Most are supportive', score: 18 },
      { label: '😐 Some hesitation', score: 10 },
      { label: '❌ Not really', score: 0 },
    ],
  },
  {
    id: 'petExperience',
    question: 'What is your experience with pets?',
    options: [
      { label: '⭐ Owned multiple pets', score: 25 },
      { label: '🐾 Had one pet before', score: 18 },
      { label: '📚 Basic knowledge', score: 10 },
      { label: '🆕 Complete beginner', score: 5 },
    ],
  },
  {
    id: 'timeAvailability',
    question: 'How much time can you dedicate to a pet daily?',
    options: [
      { label: '🕐 4+ hours', score: 25 },
      { label: '🕒 2-4 hours', score: 18 },
      { label: '🕔 1-2 hours', score: 10 },
      { label: '🕖 Less than 1 hour', score: 3 },
    ],
  },
  {
    id: 'budgetCapability',
    question: 'What is your monthly budget for pet care?',
    options: [
      { label: '💰 ₹5000+ per month', score: 25 },
      { label: '💵 ₹3000-5000', score: 18 },
      { label: '💴 ₹1500-3000', score: 10 },
      { label: '💶 Under ₹1500', score: 3 },
    ],
  },
];

function getScoreResult(score) {
  if (score >= 80) return { label: 'Excellent!', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', desc: 'You are very well prepared to adopt a pet! Your lifestyle, resources, and commitment align perfectly for pet ownership.', emoji: '🎉' };
  if (score >= 60) return { label: 'Good!', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'You are ready to adopt with some minor preparations. Consider a low-maintenance pet to start your journey.', emoji: '👍' };
  if (score >= 40) return { label: 'Needs Preparation', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', desc: 'You need some preparation before adopting. Focus on improving your living situation and learning more about pet care.', emoji: '📚' };
  return { label: 'Not Ready Yet', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', desc: 'There are significant barriers to adoption right now. Focus on addressing your living situation, time, and budget constraints first.', emoji: '⏳' };
}

const FAQ_ITEMS = [
  { q: 'What is the adoption fee?', a: 'Adoption fees typically range from ₹500-₹2000 depending on the shelter, animal age, and species. This usually covers initial vaccinations and microchipping.' },
  { q: 'Can I adopt if I live in an apartment?', a: 'Yes! Many cats and small dogs thrive in apartments. The key is ensuring they get sufficient exercise and mental stimulation.' },
  { q: 'How long does the adoption process take?', a: 'The process typically takes 3-7 days including application review, home assessment, and paperwork completion.' },
  { q: 'Do adopted animals come vaccinated?', a: 'Most shelters provide basic vaccinations before adoption. You\'ll receive a health card detailing completed vaccinations and upcoming ones.' },
  { q: 'Can I return an adopted pet?', a: 'Yes, responsible shelters have return policies. However, we encourage working through adjustment challenges with the shelter\'s support team first.' },
];

export default function AdoptionGuide() {
  const [activeTab, setActiveTab] = useState('process');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ applicantName: '', email: '', phone: '', animalType: '', readinessScore: 0 });
  const [submitting, setSubmitting] = useState(false);

  const calculateScore = () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      toast.error('Please answer all questions');
      return;
    }
    let total = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const ans = quizAnswers[q.id];
      if (ans !== undefined) total += q.options[ans].score;
    });
    setQuizScore(total);
    setForm((f) => ({ ...f, readinessScore: total, ...Object.fromEntries(QUIZ_QUESTIONS.map((q, qi) => [q.id, q.options[quizAnswers[q.id] ?? 0].label])) }));
  };

  const handleAdoptSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/adoptions', form);
      toast.success('Adoption application submitted!');
      setForm({ applicantName: '', email: '', phone: '', animalType: '', readinessScore: 0 });
    } catch {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const TABS = [
    { id: 'process', label: '📋 Adoption Process' },
    { id: 'checklist', label: '✅ Checklist' },
    { id: 'quiz', label: '🧠 Readiness Quiz' },
    { id: 'faq', label: '❓ FAQ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-3">
            Adoption <span className="gradient-text">Guide</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl">
            Everything you need to know about welcoming a new family member
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Adoption Process */}
          {activeTab === 'process' && (
            <motion.div key="process" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid gap-4">
                {ADOPTION_STEPS.map((step, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-start gap-4 card-hover">
                    <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">{step.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Step {i + 1}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">Ready to Adopt?</h3>
                <p className="text-primary-100 mb-4">Complete the readiness quiz and submit your application today.</p>
                <button onClick={() => setActiveTab('quiz')} className="bg-white text-primary-700 font-bold px-6 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                  Take Readiness Quiz →
                </button>
              </div>
            </motion.div>
          )}

          {/* Checklist */}
          {activeTab === 'checklist' && (
            <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid sm:grid-cols-2 gap-4">
                {CHECKLIST.map((cat) => (
                  <div key={cat.category} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">{cat.category}</h3>
                    <ul className="space-y-2">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaCheckCircle className="text-primary-500 shrink-0" size={12} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Vaccination Schedule */}
              <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">💉 Vaccination Schedule (Dogs)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400">Age</th>
                        <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400">Vaccine</th>
                        <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-400">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {[
                        ['6-8 weeks', 'Distemper, Parvovirus', 'First dose'],
                        ['10-12 weeks', 'DHPP (combo)', 'Booster'],
                        ['12-16 weeks', 'Rabies', 'Required by law'],
                        ['1 year', 'All vaccines', 'Annual booster'],
                        ['3 years', 'Rabies', 'Every 3 years'],
                      ].map(([age, vaccine, freq]) => (
                        <tr key={age}>
                          <td className="py-2 text-gray-700 dark:text-gray-300 font-medium">{age}</td>
                          <td className="py-2 text-gray-600 dark:text-gray-400">{vaccine}</td>
                          <td className="py-2"><span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">{freq}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Readiness Quiz */}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {quizScore !== null ? (
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className={`rounded-2xl p-8 text-center ${getScoreResult(quizScore).bg} border border-gray-100 dark:border-gray-800`}>
                    <div className="text-6xl mb-4">{getScoreResult(quizScore).emoji}</div>
                    <p className="text-5xl font-display font-black mb-2">
                      <span className={getScoreResult(quizScore).color}>{quizScore}</span>
                      <span className="text-2xl text-gray-400">/100</span>
                    </p>
                    <h2 className={`text-2xl font-bold mb-3 ${getScoreResult(quizScore).color}`}>
                      Adoption Readiness: {getScoreResult(quizScore).label}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{getScoreResult(quizScore).desc}</p>
                  </div>

                  {/* Score bar */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                      <span>Not Ready</span><span>Excellent</span>
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div className="progress-bar h-full" initial={{ width: 0 }} animate={{ width: `${quizScore}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                    </div>
                  </div>

                  {/* Submit Application */}
                  {quizScore >= 40 && (
                    <form onSubmit={handleAdoptSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">📝 Submit Adoption Application</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="input-label">Full Name</label><input value={form.applicantName} onChange={(e) => setForm(f => ({...f,applicantName:e.target.value}))} required className="input-field" placeholder="Your full name" /></div>
                        <div><label className="input-label">Email</label><input type="email" value={form.email} onChange={(e) => setForm(f => ({...f,email:e.target.value}))} required className="input-field" placeholder="your@email.com" /></div>
                        <div><label className="input-label">Phone</label><input value={form.phone} onChange={(e) => setForm(f => ({...f,phone:e.target.value}))} required className="input-field" placeholder="+91 XXXXX XXXXX" /></div>
                        <div><label className="input-label">Preferred Animal</label>
                          <select value={form.animalType} onChange={(e) => setForm(f => ({...f,animalType:e.target.value}))} required className="input-field">
                            <option value="">Select animal type</option>
                            {['Dog','Cat','Bird','Other'].map(a => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="submit" disabled={submitting} className="w-full btn-primary">{submitting ? 'Submitting...' : '❤️ Submit Application'}</button>
                    </form>
                  )}

                  <button onClick={() => { setQuizScore(null); setQuizAnswers({}); }} className="w-full btn-outline">Retake Quiz</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {QUIZ_QUESTIONS.map((q, qi) => (
                    <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        <span className="text-primary-500 font-bold">{qi + 1}.</span> {q.question}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <button key={oi} type="button"
                            onClick={() => setQuizAnswers((a) => ({ ...a, [q.id]: oi }))}
                            className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                              quizAnswers[q.id] === oi
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={calculateScore} className="w-full btn-primary py-4 text-lg">
                    🧠 Calculate My Readiness Score
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="flex items-center gap-2"><FaPaw className="text-primary-500" size={12} />{item.q}</span>
                      {openFaq === i ? <FaChevronUp className="text-primary-500 shrink-0" size={14} /> : <FaChevronDown className="text-gray-400 shrink-0" size={14} />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
