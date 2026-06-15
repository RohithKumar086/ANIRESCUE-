import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        if (data.success) {
          toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
          navigate(data.user.role === 'admin' ? '/admin' : '/');
        }
      } else {
        const data = await register(form.name, form.email, form.password, form.phone);
        if (data.success) {
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <FaPaw className="text-white text-2xl" />
          </div>
          <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back!' : 'Join AniRescue'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account today'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="input-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="input-field" />
              </div>
            )}
            <div>
              <label className="input-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="input-field" />
            </div>
            {mode === 'register' && (
              <div>
                <label className="input-label">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="input-field" />
              </div>
            )}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'} className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 mt-2">
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🔐 Sign In' : '🐾 Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-600 dark:text-blue-400">
              <p className="font-semibold mb-1">🔑 Demo Admin Credentials</p>
              <p>Email: <strong>admin@anirescue.org</strong></p>
              <p>Password: <strong>Admin@123</strong></p>
              <p className="text-xs mt-1 text-blue-400">(Run `npm run seed` in backend first)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
