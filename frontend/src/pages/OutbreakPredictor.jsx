import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Thermometer, Droplets, Users, Bug, Loader2, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { api } from '../lib/api'
import { savePrediction } from '../lib/auth'
import { Card, SectionTitle, StatPill } from '../components/Card'
import Reveal from '../components/Reveal'

const COLORS = { Low: '#9DAE92', Moderate: '#D89977', High: '#B96B4C' }

export default function OutbreakPredictor() {
  const [form, setForm] = useState({
    temperature_c: 28, humidity_pct: 75, rainfall_mm: 80,
    stagnant_water: 1, population_density: 1500, prior_cases_30d: 3,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (n, v) => setForm((p) => ({ ...p, [n]: v }))

  const submit = async () => {
    setLoading(true); setResult(null)
    try {
      const out = await api.predictWeather(form)
      setResult(out)
      await savePrediction({ kind: 'weather', input: form, output: out, top_label: out.risk_level, top_probability: out.probabilities[out.risk_level] })
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }

  const useGeolocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported here')
    toast.loading('Getting location', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=auto`)
          const d = await r.json()
          const temp = d.current?.temperature_2m
          const hum = d.current?.relative_humidity_2m
          const rain7 = (d.daily?.precipitation_sum ?? []).reduce((a, b) => a + (b || 0), 0)
          set('temperature_c', Math.round(temp))
          set('humidity_pct', Math.round(hum))
          set('rainfall_mm', Math.round(rain7))
          toast.success('Pulled weather for your location', { id: 'geo' })
        } catch { toast.error('Weather fetch failed', { id: 'geo' }) }
      },
      () => toast.error('Permission denied', { id: 'geo' })
    )
  }

  const pieData = result ? Object.entries(result.probabilities).map(([name, value]) => ({ name, value })) : []
  const tone = (lvl) => lvl === 'Low' ? 'sage' : lvl === 'Moderate' ? 'paper' : 'clay'

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Reveal>
        <SectionTitle
          kicker="Outbreak Forecast"
          title="When the air gets right for mosquitoes."
          subtitle="Temperature, humidity, and recent rainfall set the breeding clock for malaria, dengue, and chikungunya. The model reads those signals for your area, and tells you what to expect this week."
        />
      </Reveal>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div className="kicker">Conditions</div>
            <button onClick={useGeolocation} className="btn-ghost !py-1.5 !px-3 text-xs">
              <MapPin className="w-3.5 h-3.5" /> Use my location
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field icon={Thermometer} label="Temperature (°C)"        min={-10} max={50} step={0.5} val={form.temperature_c}     on={(v) => set('temperature_c', v)} />
            <Field icon={Droplets}    label="Humidity (%)"             min={0}  max={100} step={1}    val={form.humidity_pct}      on={(v) => set('humidity_pct', v)} />
            <Field icon={CloudRain}   label="Rainfall, last 7 days (mm)" min={0} max={1000} step={1}  val={form.rainfall_mm}       on={(v) => set('rainfall_mm', v)} />
            <Field icon={Users}       label="Population density (per km²)" min={1} max={50000} step={50} val={form.population_density} on={(v) => set('population_density', v)} />
            <Field icon={Bug}         label="Prior cases (30 days)"   min={0}  max={1000} step={1}    val={form.prior_cases_30d}   on={(v) => set('prior_cases_30d', v)} />
            <div>
              <label className="label">Stagnant water nearby</label>
              <select className="input" value={form.stagnant_water} onChange={(e) => set('stagnant_water', Number(e.target.value))}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
          </div>
          <div className="mt-8 ruled pt-6">
            <button onClick={submit} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Forecasting' : 'Forecast risk'}
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[440px]" delay={0.1}>
          <h3 className="font-display text-xl text-ink-900 mb-5">Outbreak risk</h3>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="e" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid place-items-center h-72 text-center">
                <p className="text-ink-500 text-sm max-w-xs serif-italic">Run the forecast on the left to see the breakdown for your area.</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid place-items-center h-72">
                <Loader2 className="w-6 h-6 animate-spin text-sage-500" />
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="r" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <StatPill label="Risk level" value={result.risk_level} tone={tone(result.risk_level)} />
                  <StatPill label="Top class" value={`${(result.probabilities[result.risk_level] * 100).toFixed(0)}%`} tone="sage" />
                </div>
                <div className="h-44">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2} stroke="none">
                        {pieData.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #EBE3D2', borderRadius: 8, fontSize: 12, color: '#2A2723' }} formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 text-xs text-ink-600 mt-1">
                  {Object.entries(COLORS).map(([k, c]) => (
                    <span key={k} className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{k}</span>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="kicker mb-3">A few suggestions</div>
                  <ul className="space-y-2">
                    {result.advice.map((a, i) => {
                      const clean = a.replace(/—/g, ',').replace(/–/g, ',')
                      return (
                        <li key={i} className="text-sm text-ink-700 flex gap-2.5 leading-relaxed">
                          <span className="text-sage-500 mt-1 flex-shrink-0">•</span>
                          <span>{clean}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, val, on, ...rest }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5"><Icon className="w-3 h-3 text-ink-500" /> {label}</label>
      <input type="number" className="input" value={val} onChange={(e) => on(e.target.value === '' ? '' : Number(e.target.value))} {...rest} />
    </div>
  )
}
