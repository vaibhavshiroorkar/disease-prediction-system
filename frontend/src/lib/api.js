const BASE = import.meta.env.VITE_ML_API_URL || 'http://localhost:7860'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  health: () => get('/health'),
  meta: () => get('/meta/symptoms'),
  predictSymptom: (symptoms, top_k = 5) => post('/predict/symptom', { symptoms, top_k }),
  predictDiabetes: (input) => post('/predict/diabetes', input),
  predictHeart: (input) => post('/predict/heart', input),
  predictStroke: (input) => post('/predict/stroke', input),
  predictWeather: (input) => post('/predict/weather', input),
}

export const API_BASE = BASE
