import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, HeartPulse, CloudRain, History } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabaseEnabled } from '../lib/supabase'

const NAV = [
  { to: '/symptoms',      label: 'Symptoms', icon: Stethoscope },
  { to: '/risk/diabetes', label: 'Risk',     icon: HeartPulse, match: '/risk' },
  { to: '/outbreak',      label: 'Outbreak', icon: CloudRain },
  { to: '/history',       label: 'History',  icon: History },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const loc = useLocation()
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 bg-paper-100/85 backdrop-blur-md border-b border-paper-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="font-display text-xl text-ink-900 tracking-tight">Aetheris</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500 hidden sm:inline">Health Intelligence</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-paper-50 border border-paper-300 rounded-full p-1 shadow-soft">
            {NAV.map(({ to, label, icon: Icon, match }) => {
              const active = loc.pathname.startsWith(match || to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="relative px-3.5 py-1.5 text-sm rounded-full flex items-center gap-1.5 text-ink-600 hover:text-ink-900 transition"
                >
                  {active && (
                    <motion.div
                      layoutId="navpill"
                      className="absolute inset-0 rounded-full bg-white border border-paper-300 shadow-soft"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-1.5 ${active ? 'text-sage-500' : ''}`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {label}
                  </span>
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-ink-500">{user.email?.split('@')[0]}</span>
                <button onClick={signOut} className="text-xs text-ink-600 hover:text-ink-900 transition">Sign out</button>
              </>
            ) : supabaseEnabled ? (
              <Link to="/signin" className="btn-primary !py-1.5 !px-4 text-xs">Sign in</Link>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-ink-400">Demo mode</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="ruled mt-32 py-12 bg-paper-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid sm:grid-cols-2 gap-6 text-sm text-ink-600">
          <div>
            <div className="font-display text-lg text-ink-900 mb-1">Aetheris</div>
            <div className="leading-relaxed max-w-md">
              A small, calm corner of the internet for asking about your health.
              Educational only. Not a substitute for medical advice.
            </div>
          </div>
          <div className="sm:text-right text-xs text-ink-500 leading-relaxed">
            <div>Built with FastAPI, scikit-learn, React, Supabase.</div>
            <div className="mt-1 serif-italic text-ink-700">Made with care, not certainty.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
