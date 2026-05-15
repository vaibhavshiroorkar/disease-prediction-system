import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { savePrediction } from '../lib/auth'
import { Card, SectionTitle } from '../components/Card'
import ProbabilityBar from '../components/ProbabilityBar'
import Reveal from '../components/Reveal'

function pretty(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function SymptomChecker() {
  const [meta, setMeta] = useState({ symptoms: [], diseases: [] })
  const [selected, setSelected] = useState(new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { api.meta().then(setMeta).catch(() => toast.error('Could not load symptom list')) }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return meta.symptoms.slice(0, 28)
    return meta.symptoms.filter((s) => s.toLowerCase().includes(q)).slice(0, 32)
  }, [meta.symptoms, query])

  const toggle = (s) => setSelected((prev) => {
    const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n
  })

  const submit = async () => {
    if (selected.size === 0) return toast.error('Please pick at least one symptom')
    setLoading(true); setResult(null)
    try {
      const list = [...selected]
      const out = await api.predictSymptom(list, 5)
      setResult(out)
      const top = out.predictions[0]
      if (top) await savePrediction({ kind: 'symptom', input: { symptoms: list }, output: out, top_label: top.disease, top_probability: top.probability })
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }

  const clear = () => { setSelected(new Set()); setResult(null) }

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Reveal>
        <SectionTitle
          kicker="Symptom Checker"
          title="Tell us what's bothering you, in plain words."
          subtitle="Pick every symptom you're experiencing. The model will rank the conditions that best explain the combination, and show which of your symptoms it found a match for."
        />
      </Reveal>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input !pl-10"
              placeholder="Search symptoms, e.g. fever, joint pain, dry cough"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {selected.size > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="kicker">Selected ({selected.size})</span>
                <button onClick={clear} className="text-xs text-ink-500 hover:text-clay-500 transition">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...selected].map((s) => (
                  <motion.button
                    key={s}
                    layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    onClick={() => toggle(s)}
                    className="chip-active"
                  >
                    {pretty(s)} <X className="w-3 h-3" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <span className="kicker">{query ? 'Results' : 'Common symptoms'}</span>
            <div className="mt-3 flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
              {filtered.length === 0 && <span className="text-sm text-ink-500">No matches</span>}
              {filtered.map((s) => (
                <button key={s} onClick={() => toggle(s)} className={selected.has(s) ? 'chip-active' : 'chip'}>
                  {pretty(s)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 ruled pt-6">
            <button onClick={submit} disabled={loading || selected.size === 0} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Reading the signals' : 'Read the signals'}
            </button>
            <span className="text-xs text-ink-500">{selected.size} selected</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[440px]" delay={0.1}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-ink-900">Most likely conditions</h3>
            {result && <span className="font-mono text-[11px] text-ink-500">{(result.model_metrics?.accuracy * 100).toFixed(1)}% acc</span>}
          </div>

          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid place-items-center h-72 text-center">
                <p className="text-ink-500 text-sm max-w-xs serif-italic">
                  Pick a few symptoms on the left, then run the model. Results will appear here.
                </p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid place-items-center h-72">
                <Loader2 className="w-6 h-6 animate-spin text-sage-500" />
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {result.predictions.map((p, i) => (
                  <ProbabilityBar
                    key={p.disease}
                    label={p.disease}
                    sub={`${p.matching_symptoms.length} of yours match`}
                    value={p.probability}
                    tone={i === 0 ? 'sage' : 'ink'}
                    delay={i * 0.08}
                  />
                ))}
                {result.predictions[0]?.probability < 0.4 && (
                  <div className="mt-6 flex gap-3 p-4 rounded-lg border border-clay-100 bg-clay-50 text-xs text-clay-600 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Confidence is low. Consider adding more specific symptoms, or asking a clinician.</span>
                  </div>
                )}
                <p className="text-[11px] text-ink-500 leading-relaxed pt-3 ruled">
                  These are statistical guesses, not diagnoses. Use them as a starting place, not a destination.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
