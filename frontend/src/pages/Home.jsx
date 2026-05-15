import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, HeartPulse, CloudRain, ArrowDown, ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'

export default function Home() {
  return (
    <div>
      {/* Quiet hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center relative">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl sm:text-7xl md:text-[84px] text-ink-900 leading-[1.02] tracking-tight max-w-4xl"
        >
          Ask, gently.<br />
          <span className="serif-italic text-sage-500">Listen, before you worry.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-9 max-w-lg text-ink-600 leading-relaxed"
        >
          Match your symptoms to 40 likely conditions, score your risk for diabetes, heart disease, and stroke,
          and forecast mosquito-borne outbreaks in your area. Every result comes with the reasons behind it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.7 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-500"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </motion.div>
      </section>

      {/* Three feature cards */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24 sm:py-28">
        <Reveal>
          <header className="mb-14 max-w-2xl">
            <div className="kicker mb-3">Three quiet tools</div>
            <h2 className="font-display text-4xl sm:text-5xl text-ink-900 leading-[1.05] tracking-tight">
              The shape of the place.
            </h2>
            <p className="text-ink-600 mt-4 leading-relaxed">
              No dashboards, no streaks, no notifications. Just three small rooms,
              each one good at one thing.
            </p>
          </header>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const tint = TINTS[f.tint]
            return (
              <Reveal key={f.to} delay={i * 0.08}>
                <Link
                  to={f.to}
                  className={`group relative block rounded-xl p-7 sm:p-8 h-full border shadow-soft hover:-translate-y-0.5 hover:shadow-warm transition-all duration-300 ${tint.bg} ${tint.border} ${tint.borderHover}`}
                >
                  <div className="flex items-baseline justify-between mb-6">
                    <div className={`w-11 h-11 rounded-full grid place-items-center border ${tint.iconBg} ${tint.iconBorder}`}>
                      <f.icon className={`w-4.5 h-4.5 ${tint.iconColor}`} strokeWidth={1.7} />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-ink-400">{`0${i + 1}`}</span>
                  </div>
                  <h3 className="font-display text-2xl text-ink-900 leading-tight">{f.title}</h3>
                  <p className={`serif-italic mt-1 mb-4 ${tint.italic}`}>{f.italic}</p>
                  <p className="text-sm text-ink-700 leading-relaxed">{f.body}</p>
                  <div className={`mt-7 pt-5 border-t flex items-center justify-between ${tint.rule}`}>
                    <span className="font-mono text-[11px] tracking-wider text-ink-500">{f.stat}</span>
                    <span className="text-sm text-ink-900 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Pull quote */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-20 text-center">
        <Reveal>
          <p className="font-display text-3xl sm:text-4xl text-ink-900 leading-[1.2] tracking-tight">
            Models should be{' '}
            <span className="serif-italic text-sage-500">honest about what they know.</span>
            {' '}So every prediction here ships with the features that drove it,
            the confidence behind it, and a plain word for the risk band.
          </p>
        </Reveal>
      </section>

      {/* How it thinks */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-10 items-end mb-12">
            <div>
              <div className="kicker mb-3">How it thinks</div>
              <h2 className="font-display text-4xl text-ink-900 leading-[1.05] tracking-tight">
                Two small models,<br />
                <span className="serif-italic text-sage-500">deciding together.</span>
              </h2>
            </div>
            <p className="text-ink-700 leading-relaxed">
              Each prediction is the soft vote of a Random Forest and a Gradient
              Boosting classifier. Where they agree, confidence is high. Where they
              hesitate, the interface tells you so, and suggests you ask a clinician.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="paper-card-soft p-7 h-full">
                <div className="font-mono text-[10px] tracking-widest text-sage-500 mb-3">STEP {String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-display text-xl text-ink-900 mb-2">{s.t}</h3>
                <p className="text-sm text-ink-700 leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20">
        <Reveal>
          <div className="kicker mb-3">By the numbers</div>
          <h2 className="font-display text-4xl text-ink-900 mb-12 max-w-xl leading-[1.05] tracking-tight">
            What the models have actually learned.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.k} delay={i * 0.06}>
              <div className="border-t-2 border-ink-900 pt-4">
                <div className="font-display text-5xl text-ink-900 leading-none">{n.v}</div>
                <div className="text-xs uppercase tracking-widest text-ink-500 mt-3">{n.k}</div>
                {n.note && <div className="text-xs text-ink-500 mt-1 serif-italic">{n.note}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-24 text-center">
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl text-ink-900 leading-[1.05] tracking-tight">
            When you have a moment,<br />
            <span className="serif-italic text-sage-500">start somewhere small.</span>
          </h2>
          <div className="mt-9 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/symptoms" className="btn-primary">
              Begin a symptom check <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/outbreak" className="btn-link">
              or look at outbreak risk
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

const FEATURES = [
  {
    to: '/symptoms',
    icon: Stethoscope,
    title: 'Symptom Checker',
    italic: 'a careful first read',
    body: 'Tell it what you feel, in plain words. It ranks the conditions that fit best, and shows which of your symptoms each one explains.',
    stat: '40 conditions',
    tint: 'navy',
  },
  {
    to: '/risk/diabetes',
    icon: HeartPulse,
    title: 'Risk Assessments',
    italic: 'three questions worth asking',
    body: 'For diabetes, heart disease, and stroke, it returns a calibrated probability and the readings that pushed it up or down.',
    stat: '3 conditions',
    tint: 'rust',
  },
  {
    to: '/outbreak',
    icon: CloudRain,
    title: 'Outbreak Predictor',
    italic: 'weather, made local',
    body: 'For mosquito-borne disease, it reads temperature, humidity, and recent rainfall, then tells you whether this week looks risky for your area.',
    stat: '3 vectors',
    tint: 'oat',
  },
]

const TINTS = {
  navy: {
    bg:          'bg-sage-50',
    border:      'border-sage-100',
    borderHover: 'hover:border-sage-300',
    iconBg:      'bg-white',
    iconBorder:  'border-sage-100',
    iconColor:   'text-sage-500',
    italic:      'text-sage-500',
    rule:        'border-sage-100',
  },
  rust: {
    bg:          'bg-clay-50',
    border:      'border-clay-100',
    borderHover: 'hover:border-clay-300',
    iconBg:      'bg-white',
    iconBorder:  'border-clay-100',
    iconColor:   'text-clay-500',
    italic:      'text-clay-500',
    rule:        'border-clay-100',
  },
  oat: {
    bg:          'bg-paper-200',
    border:      'border-paper-300',
    borderHover: 'hover:border-ink-300',
    iconBg:      'bg-white',
    iconBorder:  'border-paper-300',
    iconColor:   'text-ink-700',
    italic:      'text-ink-700',
    rule:        'border-paper-300',
  },
}

const STEPS = [
  { t: 'You describe',    d: 'Forms ask for symptoms, vital readings, or local weather. Nothing is required, nothing is tracked.' },
  { t: 'Two models vote', d: 'A Random Forest and a Gradient Boosting classifier each produce a probability. The interface averages them, softly.' },
  { t: 'Reasons appear',  d: 'You see the top features that drove the call, the confidence behind it, and a plain word for the risk band.' },
]

const NUMBERS = [
  { v: '40',     k: 'Conditions',       note: 'across the symptom model' },
  { v: '125',    k: 'Symptoms covered', note: 'searchable, in plain words' },
  { v: '5',      k: 'Trained models',   note: 'each an ensemble of two' },
  { v: '<150ms', k: 'Median latency',   note: 'on a warm Space' },
]
