import { Link, useLocation } from 'react-router-dom';
import { Home, Stethoscope, HeartPulse, CloudRain, LayoutDashboard } from 'lucide-react';

const ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/symptoms', icon: Stethoscope, label: 'Symptoms' },
  { path: '/risk', icon: HeartPulse, label: 'Risk' },
  { path: '/weather', icon: CloudRain, label: 'Weather' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'History' },
];

/**
 * Fixed bottom navigation for mobile screens.
 * Shown below md breakpoint, hidden on desktop.
 */
export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-xs font-medium ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
