import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, Stethoscope, HeartPulse, CloudRain, Info, Home, BookOpen, LayoutDashboard } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { path: '/risk', label: 'Risk Check', icon: HeartPulse },
  { path: '/weather', label: 'Weather', icon: CloudRain },
  { path: '/diseases', label: 'Diseases', icon: BookOpen },
  { path: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Focus trap in mobile menu
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableEls = menuRef.current.querySelectorAll('a, button');
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/90 border-b border-gray-100" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Disease Prediction System Home">
            <div className="p-2 bg-primary-600 rounded-xl group-hover:bg-primary-700 transition-colors">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Disease<span className="text-primary-600">Predict</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={location.pathname === path ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-5 w-5 text-gray-900" /> : <Menu className="h-5 w-5 text-gray-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-menu" ref={menuRef} className="md:hidden border-t border-gray-100 bg-white" role="menu">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                role="menuitem"
                aria-current={location.pathname === path ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
