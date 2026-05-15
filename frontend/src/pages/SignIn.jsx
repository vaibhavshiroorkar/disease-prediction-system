import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { Card } from '../components/Card'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!supabaseEnabled) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl text-ink-900 mb-3">Auth is paused</h2>
        <p className="text-ink-600 text-sm leading-relaxed">
          Configure your Supabase environment variables to enable accounts and history.
        </p>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
      const { error } = await fn.bind(supabase.auth)({ email, password })
      if (error) throw error
      toast.success(mode === 'signin' ? 'Welcome back' : 'Check your email to confirm')
      navigate('/')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) toast.error(error.message)
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <Card>
        <h1 className="font-display text-3xl text-ink-900 text-center mb-1 leading-tight">
          {mode === 'signin' ? 'Welcome back.' : (
            <>Make a small <span className="serif-italic text-sage-600">corner</span> for yourself.</>
          )}
        </h1>
        <p className="text-center text-sm text-ink-600 mb-7 leading-relaxed">
          Your predictions stay private to you.
        </p>

        <button onClick={google} className="btn-ghost w-full mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#2A2723" d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.21 0-5.83-2.66-5.83-5.95s2.62-5.95 5.83-5.95c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.6 3.65 14.55 2.7 12 2.7 6.94 2.7 2.85 6.79 2.85 11.85S6.94 21 12 21c5.45 0 9-3.83 9-9.2 0-.6-.06-1.05-.15-1.7Z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-[11px] uppercase tracking-widest text-ink-400">
          <span className="flex-1 h-px bg-paper-300" />or<span className="flex-1 h-px bg-paper-300" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === 'signin' ? 'Sign in' : 'Sign up'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <button onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))} className="text-xs text-ink-500 hover:text-ink-900 transition mt-6 w-full text-center">
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </Card>
    </div>
  )
}
