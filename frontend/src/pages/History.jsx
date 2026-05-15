import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Card, SectionTitle } from '../components/Card'
import Reveal from '../components/Reveal'

const KIND_LABEL = {
  symptom:  'Symptom check',
  diabetes: 'Diabetes risk',
  heart:    'Heart risk',
  stroke:   'Stroke risk',
  weather:  'Outbreak forecast',
}

export default function History() {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!supabaseEnabled || !user) { setRows([]); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) toast.error(error.message)
    else setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { if (!authLoading) load() }, [authLoading, user])

  const remove = async (id) => {
    if (!supabaseEnabled) return
    const { error } = await supabase.from('predictions').delete().eq('id', id)
    if (error) toast.error(error.message)
    else setRows((r) => r.filter((x) => x.id !== id))
  }

  if (!supabaseEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl text-ink-900 mb-3">History needs Supabase</h2>
        <p className="text-ink-600 text-sm leading-relaxed">
          Add <code className="font-mono text-sage-600">VITE_SUPABASE_URL</code> and <code className="font-mono text-sage-600">VITE_SUPABASE_ANON_KEY</code> to enable persistent history.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl text-ink-900 mb-3">Sign in to see your history</h2>
        <p className="text-ink-600 text-sm leading-relaxed mb-6">
          Each prediction you run while signed in is stored privately, only to you.
        </p>
        <Link to="/signin" className="btn-primary">Sign in</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Reveal>
        <SectionTitle kicker="History" title="Your last 50 predictions." subtitle="Stored privately in Supabase, behind row-level security." />
      </Reveal>

      {loading && <div className="text-ink-500 text-sm">Loading</div>}

      {!loading && rows.length === 0 && (
        <Card>
          <div className="text-center text-ink-600 py-10 leading-relaxed">
            No predictions yet. Try a <Link className="btn-link" to="/symptoms">symptom check</Link> to get started.
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <Reveal key={r.id} delay={0}>
            <div className="paper-card p-5 flex items-center gap-5 hover:border-ink-300 transition group">
              <div className="font-mono text-[10px] uppercase tracking-widest text-sage-600 w-28 flex-shrink-0">
                {KIND_LABEL[r.kind] ?? r.kind}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg text-ink-900">
                  {r.top_label ?? '...'}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              {r.top_probability != null && (
                <div className="font-mono text-sm text-ink-800">{(r.top_probability * 100).toFixed(1)}%</div>
              )}
              <button onClick={() => remove(r.id)} className="text-ink-400 hover:text-clay-500 transition p-2 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
