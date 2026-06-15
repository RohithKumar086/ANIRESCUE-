import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaPaw, FaSun, FaMoon, FaBars, FaTimes,
  FaUser, FaSignOutAlt, FaTachometerAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/',             label: 'Home' },
  { to: '/report',       label: 'Report Animal' },
  { to: '/shelters',     label: 'Find Shelters' },
  { to: '/adoption',     label: 'Adoption Guide' },
  { to: '/ai-assistant', label: 'AI Assistant' },
  { to: '/volunteer',    label: 'Volunteer' },
  { to: '/contact',      label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/50 dark:border-gray-700/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FaPaw className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Ani<span className="text-primary-600">Rescue</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* SOS Button */}
            <Link
              to="/report"
              className="hidden sm:flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl sos-pulse transition-colors"
            >
              🆘 SOS Report
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:scale-110 transition-transform"
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {/* User menu */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <FaTachometerAlt size={13} /> Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  <FaSignOutAlt size={13} /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-1.5 btn-primary !py-2 !px-4 text-sm"
              >
                <FaUser size={12} /> Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 flex flex-col gap-2">
                <Link
                  to="/report"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white font-bold px-4 py-3 rounded-xl"
                >
                  🆘 Emergency SOS Report
                </Link>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="text-center text-primary-600 dark:text-primary-400 font-medium py-2">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="text-center text-red-500 font-medium py-2">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="text-center btn-primary">
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
