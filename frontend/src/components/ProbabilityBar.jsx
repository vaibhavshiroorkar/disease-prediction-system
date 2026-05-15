import { motion } from 'framer-motion'

export default function ProbabilityBar({ value, label, sub, tone = 'sage', delay = 0 }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const fill = {
    sage: 'bg-sage-500',
    clay: 'bg-clay-500',
    sky:  'bg-sky-500',
    ink:  'bg-ink-800',
  }[tone]
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-900">{label}</span>
          {sub && <span className="text-[11px] text-ink-500">{sub}</span>}
        </div>
        <span className="font-mono text-xs text-ink-700">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-paper-200 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full ${fill}`}
        />
      </div>
    </div>
  )
}
