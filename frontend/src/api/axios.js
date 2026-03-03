import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Simple in-memory cache ─────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── Symptom Prediction ─────────────────────
export const predictFromSymptoms = async (symptoms) => {
  const { data } = await api.post('/predict/symptoms', { symptoms });
  return data;
};

export const getMetadata = async () => {
  const cached = getCached('metadata');
  if (cached) return cached;

  const { data } = await api.get('/predict/metadata');
  setCache('metadata', data);
  return data;
};

// ─── Health Risk Assessment ─────────────────
export const assessDiabetesRisk = async (params) => {
  const { data } = await api.post('/risk/diabetes', params);
  return data;
};

export const assessHeartRisk = async (params) => {
  const { data } = await api.post('/risk/heart', params);
  return data;
};

export const assessStrokeRisk = async (params) => {
  const { data } = await api.post('/risk/stroke', params);
  return data;
};

// ─── Weather Disease Risk ───────────────────
export const predictWeatherRisk = async (params) => {
  const { data } = await api.post('/weather/risk', params);
  return data;
};

export const getRegions = async () => {
  const cached = getCached('regions');
  if (cached) return cached;

  const { data } = await api.get('/weather/regions');
  setCache('regions', data);
  return data;
};

export default api;
