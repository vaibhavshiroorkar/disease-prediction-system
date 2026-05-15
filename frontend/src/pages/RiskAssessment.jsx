import { useEffect, useState } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { savePrediction } from '../lib/auth'
import { Card, SectionTitle, StatPill } from '../components/Card'
import ProbabilityBar from '../components/ProbabilityBar'
import Reveal from '../components/Reveal'

const KINDS = {
  diabetes: {
    label: 'Diabetes', endpoint: 'predictDiabetes',
    blurb: 'A Pima-style assessment. Glucose, BMI, and family history tend to drive most of the signal.',
    fields: [
      { name: 'pregnancies',       label: 'Pregnancies',           type: 'number', min: 0, max: 20, step: 1, default: 1 },
      { name: 'glucose',           label: 'Glucose (mg/dL)',       type: 'number', min: 40, max: 300, step: 1, default: 110 },
      { name: 'blood_pressure',    label: 'Blood pressure (mm Hg)', type: 'number', min: 30, max: 200, step: 1, default: 75 },
      { name: 'skin_thickness',    label: 'Skin thickness (mm)',   type: 'number', min: 0, max: 100, step: 1, default: 20 },
      { name: 'insulin',           label: 'Insulin (mu U/ml)',     type: 'number', min: 0, max: 900, step: 1, default: 80 },
      { name: 'bmi',               label: 'BMI',                   type: 'number', min: 10, max: 70, step: 0.1, default: 27 },
      { name: 'diabetes_pedigree', label: 'Pedigree function',     type: 'number', min: 0, max: 3, step: 0.01, default: 0.4 },
      { name: 'age',               label: 'Age',                   type: 'number', min: 1, max: 120, step: 1, default: 35 },
    ],
  },
  heart: {
    label: 'Heart Disease', endpoint: 'predictHeart',
    blurb: 'A Cleveland-style assessment, modeled on resting and exercise readings.',
    fields: [
      { name: 'age',      label: 'Age',                       type: 'number', min: 1, max: 120, default: 50 },
      { name: 'sex',      label: 'Sex',                       type: 'select', options: [['Male', 1], ['Female', 0]], default: 1 },
      { name: 'cp',       label: 'Chest pain type',           type: 'select', options: [['Typical angina', 0], ['Atypical angina', 1], ['Non-anginal', 2], ['Asymptomatic', 3]], default: 1 },
      { name: 'trestbps', label: 'Resting BP (mm Hg)',        type: 'number', min: 60, max: 240, default: 130 },
      { name: 'chol',     label: 'Cholesterol (mg/dL)',       type: 'number', min: 100, max: 700, default: 220 },
      { name: 'fbs',      label: 'Fasting blood sugar > 120', type: 'select', options: [['No', 0], ['Yes', 1]], default: 0 },
      { name: 'restecg',  label: 'Resting ECG',               type: 'select', options: [['Normal', 0], ['ST-T abnormality', 1], ['LV hypertrophy', 2]], default: 0 },
      { name: 'thalach',  label: 'Max heart rate',            type: 'number', min: 50, max: 240, default: 150 },
      { name: 'exang',    label: 'Exercise-induced angina',   type: 'select', options: [['No', 0], ['Yes', 1]], default: 0 },
      { name: 'oldpeak',  label: 'ST depression',             type: 'number', min: 0, max: 10, step: 0.1, default: 1.0 },
      { name: 'slope',    label: 'ST slope',                  type: 'select', options: [['Upsloping', 0], ['Flat', 1], ['Downsloping', 2]], default: 1 },
      { name: 'ca',       label: 'Major vessels (0 to 3)',    type: 'number', min: 0, max: 4, default: 0 },
      { name: 'thal',     label: 'Thalassemia',               type: 'select', options: [['Normal', 1], ['Fixed defect', 2], ['Reversible defect', 3]], default: 2 },
    ],
  },
  stroke: {
    label: 'Stroke', endpoint: 'predictStroke',
    blurb: 'Risk weights drawn from age, blood pressure history, glucose, BMI, and smoking.',
    fields: [
      { name: 'gender',            label: 'Gender',                type: 'select', options: [['Male', 1], ['Female', 0]], default: 1 },
      { name: 'age',               label: 'Age',                   type: 'number', min: 1, max: 120, default: 55 },
      { name: 'hypertension',      label: 'Hypertension',          type: 'select', options: [['No', 0], ['Yes', 1]], default: 0 },
      { name: 'heart_disease',     label: 'Heart disease',         type: 'select', options: [['No', 0], ['Yes', 1]], default: 0 },
      { name: 'avg_glucose_level', label: 'Avg. glucose (mg/dL)',  type: 'number', min: 40, max: 400, default: 105 },
      { name: 'bmi',               label: 'BMI',                   type: 'number', min: 10, max: 70, step: 0.1, default: 27 },
      { name: 'smoking_status',    label: 'Smoking',               type: 'select', options: [['Never', 0], ['Former', 1], ['Current', 2]], default: 0 },
    ],
  },
}

export default function RiskAssessment() {
  const { kind = 'diabetes' } = useParams()
  const cfg = KINDS[kind] ?? KINDS.diabetes
  const [form, setForm] = useState(() => Object.fromEntries(cfg.fields.map((f) => [f.name, f.default])))
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    setForm(Object.fromEntries(cfg.fields.map((f) => [f.name, f.default])))
    setResult(null)
  }, [kind])

  const set = (n, v) => setForm((p) => ({ ...p, [n]: v }))

  const submit = async () => {
    setLoading(true); setResult(null)
    try {
      const out = await api[cfg.endpoint](form)
      setResult(out)
      await savePrediction({ kind, input: form, output: out, top_label: out.risk_band, top_probability: out.probability })
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }

  const tone = (band) => band === 'Low' ? 'sage' : band === 'Moderate' ? 'paper' : 'clay'

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Reveal>
        <SectionTitle
          kicker="Risk Assessment"
          title="A calibrated probability, with reasons attached."
          subtitle="Each model is an ensemble that returns a number you can read at a glance, alongside the inputs that pushed the answer up or down."
        />
      </Reveal>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {Object.entries(KINDS).map(([k, v]) => (
          <NavLink key={k} to={`/risk/${k}`}
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm transition border ${
                isActive
                  ? 'bg-ink-900 border-ink-900 text-paper-50'
                  : 'bg-paper-50 border-paper-300 text-ink-700 hover:border-ink-300'
              }`
            }>
            {v.label}
          </NavLink>
        ))}
      </div>

      <p className="text-ink-600 max-w-2xl mb-8 leading-relaxed serif-italic">{cfg.blurb}</p>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3" key={`form-${kind}`}>
          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
            {cfg.fields.map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="input" value={form[f.name] ?? f.default} onChange={(e) => set(f.name, Number(e.target.value))}>
                    {f.options.map(([lbl, val]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                ) : (
                  <input
                    type="number" className="input"
                    min={f.min} max={f.max} step={f.step ?? 1}
                    value={form[f.name] ?? ''}
                    onChange={(e) => set(f.name, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 ruled pt-6">
            <button onClick={submit} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Computing' : 'Compute risk'}
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[440px]" delay={0.1}>
          <h3 className="font-display text-xl text-ink-900 mb-5">Result</h3>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="e" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid place-items-center h-72 text-center">
                <p className="text-ink-500 text-sm max-w-xs serif-italic">Fill in what you know on the left, and we'll compute a calibrated probability here.</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid place-items-center h-72">
                <Loader2 className="w-6 h-6 animate-spin text-sage-500" />
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="r" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatPill label="Probability" value={`${(result.probability * 100).toFixed(1)}%`} tone="sage" />
                  <StatPill label="Risk band" value={result.risk_band} tone={tone(result.risk_band)} />
                </div>
                <ProbabilityBar label="Risk score" value={result.probability} tone={tone(result.risk_band)} />
                {result.top_features?.length > 0 && (
                  <div className="mt-7">
                    <div className="kicker mb-3">Top contributing features</div>
                    <div className="space-y-2">
                      {result.top_features.map((f) => (
                        <div key={f.feature} className="flex items-center justify-between text-sm bg-paper-50 border border-paper-300 rounded-lg px-3.5 py-2.5">
                          <span className="text-ink-800 capitalize">{f.feature.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-[11px] text-ink-500">
                            value <span className="text-ink-900">{f.value}</span>
                            {' · '}
                            imp <span className="text-sage-600">{(f.importance * 100).toFixed(1)}%</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
