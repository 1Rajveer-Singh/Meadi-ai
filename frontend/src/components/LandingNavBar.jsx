import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Menu, X, Sparkles, LogIn, UserPlus } from 'lucide-react';

const LandingNavBar = ({ onAuthClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Technology', href: '#technology' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav shadow-lg bg-white/90'
          : 'bg-primary-600/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="relative"
            >
              <motion.div
                className={`absolute inset-0 ${scrolled ? 'bg-primary-500' : 'bg-white'} rounded-xl blur-lg opacity-50`}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={`relative w-12 h-12 ${scrolled ? 'bg-gradient-to-br from-primary-600 to-purple-600' : 'bg-white'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Activity className={`w-7 h-7 ${scrolled ? 'text-white' : 'text-primary-600'}`} />
              </div>
            </motion.div>
            <div>
              <h1 className={`text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                AgenticAI <span className={scrolled ? 'text-primary-600' : 'text-health-400'}>HealthGuard</span>
              </h1>
              <p className={`text-xs ${scrolled ? 'text-gray-600' : 'text-white/80'} hidden sm:block`}>AI-Powered Medical Diagnostics</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                  scrolled
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAuthClick('login')}
              className={`px-6 py-2.5 font-semibold rounded-xl border-2 transition-all flex items-center space-x-2 ${
                scrolled
                  ? 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  : 'text-white border-white/30 hover:bg-white/10'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAuthClick('register')}
              className="relative group"
            >
              <motion.div
                className={`absolute inset-0 rounded-xl blur-xl opacity-50 ${
                  scrolled ? 'bg-primary-500' : 'bg-white'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={`relative px-6 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 font-bold ${
                scrolled
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                  : 'bg-white text-primary-600'
              }`}>
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className={`w-4 h-4 ${scrolled ? 'text-health-400' : 'text-health-600'}`} />
                </motion.div>
              </div>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-white font-medium rounded-lg hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2 border-t border-white/20">
              <button
                onClick={() => {
                  onAuthClick('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/10 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => {
                  onAuthClick('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-white text-primary-600 font-bold rounded-lg shadow-lg flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default LandingNavBar;
