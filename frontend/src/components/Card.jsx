import { motion } from 'framer-motion'

export function Card({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`paper-card p-6 sm:p-8 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SectionTitle({ kicker, title, subtitle, align = 'left' }) {
  const ta = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`mb-10 ${ta}`}>
      {kicker && <div className="kicker mb-3">{kicker}</div>}
      <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink-900 leading-[1.1]">
        {title}
      </h2>
      {subtitle && <p className="text-ink-600 mt-3 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function StatPill({ label, value, tone = 'sage' }) {
  const map = {
    sage: 'bg-sage-50 border-sage-100 text-sage-700',
    clay: 'bg-clay-50 border-clay-100 text-clay-600',
    paper: 'bg-paper-100 border-paper-300 text-ink-800',
    sky: 'bg-paper-100 border-paper-300 text-sky-600',
  }
  return (
    <div className={`rounded-lg border p-4 ${map[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  )
}
