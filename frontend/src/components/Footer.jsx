import { Link } from 'react-router-dom';
import { FaPaw, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <FaPaw className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Ani<span className="text-primary-500">Rescue</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Connecting citizens, volunteers, and shelters to save animal lives across India. Every animal deserves care, safety, and love.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/report', label: 'Report Injured Animal' },
                { to: '/shelters', label: 'Find Shelters' },
                { to: '/adoption', label: 'Adoption Guide' },
                { to: '/volunteer', label: 'Become a Volunteer' },
                { to: '/track', label: 'Track Your Report' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <span className="text-primary-600">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Animal Welfare */}
          <div>
            <h3 className="font-semibold text-white mb-4">Animal Welfare</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {['First Aid for Animals', 'Animal Rights Laws', 'Wildlife Conservation', 'Anti-Cruelty Laws', 'Stray Animal Care', 'Vaccination Drives'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-accent-500">🐾</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaPhone className="text-primary-500 mt-0.5 shrink-0" size={13} />
                <div>
                  <p className="text-white font-medium">Helpline (24/7)</p>
                  <p className="text-gray-400">1800-XXX-XXXX</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-primary-500 mt-0.5 shrink-0" size={13} />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-400">help@anirescue.org</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary-500 mt-0.5 shrink-0" size={13} />
                <div>
                  <p className="text-white font-medium">Pan India Network</p>
                  <p className="text-gray-400">50+ Cities Covered</p>
                </div>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-red-900/30 border border-red-800/50 rounded-xl">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">🆘 Emergency</p>
              <p className="text-white font-bold text-lg mt-1">1800-XXX-XXXX</p>
              <p className="text-gray-400 text-xs">Available 24/7 for critical animal emergencies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AniRescue. All rights reserved.</p>
          <p>Made with ❤️ for Animal Welfare</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
