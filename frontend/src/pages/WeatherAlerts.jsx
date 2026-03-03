import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  CloudRain,
  Thermometer,
  Droplets,
  CloudLightning,
  Loader2,
  AlertTriangle,
  Shield,
  MapPin,
  Info,
  Heart,
  Umbrella,
  LocateFixed,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { predictWeatherRisk } from '../api/axios';
import useStore from '../store/useStore';
import ExportButton from '../components/ui/ExportButton';

const REGIONS = [
  { key: 'tropical', label: 'Tropical', desc: 'Hot & humid (Mumbai, Bangkok, Lagos)' },
  { key: 'subtropical', label: 'Subtropical', desc: 'Warm, moderate humidity (Delhi, Sao Paulo)' },
  { key: 'temperate', label: 'Temperate', desc: 'Mild with seasons (London, New York)' },
  { key: 'arid', label: 'Arid / Desert', desc: 'Hot and dry (Jaipur, Dubai, Phoenix)' },
  { key: 'mediterranean', label: 'Mediterranean', desc: 'Warm dry summers (Barcelona, Cape Town)' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getRiskColor = (level) => {
  switch (level) {
    case 'Very High': return { bg: 'bg-red-100', text: 'text-red-800', bar: '#ef4444' };
    case 'High': return { bg: 'bg-orange-100', text: 'text-orange-800', bar: '#f97316' };
    case 'Moderate': return { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: '#eab308' };
    default: return { bg: 'bg-green-100', text: 'text-green-800', bar: '#22c55e' };
  }
};

export default function WeatherAlerts() {
  const [form, setForm] = useState({
    temperature: '',
    humidity: '',
    rainfall: '',
    month: new Date().getMonth() + 1,
    region_type: 'tropical',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const resultsRef = useRef(null);
  const { addToHistory } = useStore();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain`
          );
          const data = await res.json();
          if (data.current) {
            setForm((prev) => ({
              ...prev,
              temperature: String(data.current.temperature_2m ?? ''),
              humidity: String(data.current.relative_humidity_2m ?? ''),
              rainfall: String(data.current.rain ?? '0'),
            }));
            toast.success('Weather data loaded from your location!');
          }
        } catch {
          toast.error('Could not fetch weather for your location.');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast.error('Location access was denied.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await predictWeatherRisk({
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        rainfall: parseFloat(form.rainfall),
        month: parseInt(form.month),
        region_type: form.region_type,
      });
      setResults(data);
      toast.success('Weather risk analysis complete!');

      const topRisk = data?.risks?.[0];
      addToHistory({
        type: 'weather',
        label: 'Weather Disease Alert',
        result: topRisk ? `${topRisk.disease}: ${topRisk.risk_level}` : 'Analysis complete',
        details: {
          region: form.region_type,
          temperature: form.temperature,
          humidity: form.humidity,
          rainfall: form.rainfall,
          month: MONTHS[parseInt(form.month) - 1],
          risks: data?.risks?.map((r) => `${r.disease}: ${r.risk_level}`),
        },
      });
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong. Check your inputs and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const chartData = results?.risks.map((r) => ({
    name: r.disease,
    risk: Math.round(r.risk_score * 100),
    fill: getRiskColor(r.risk_level).bar,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Weather Disease Alerts | MediPredict AI</title>
        <meta name="description" content="Check how weather conditions affect disease risk in your area with AI-powered analysis." />
      </Helmet>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-amber-50 rounded-xl">
            <CloudRain className="h-7 w-7 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="section-title !mb-0">Weather Disease Alerts</h1>
            <p className="text-gray-500 text-sm mt-1">
              Weather shapes disease risk. Enter conditions to see what's likely in your area.
            </p>
          </div>
        </div>
      </div>

      {/* Context Banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Umbrella className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-amber-700 text-sm">
          Mosquito-borne diseases like dengue and malaria thrive in specific weather conditions. This tool uses
          epidemiological data to estimate your risk based on temperature, humidity, rainfall, and region.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900">Current Weather</h2>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={geoLoading}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
            >
              {geoLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LocateFixed className="h-3.5 w-3.5" />
              )}
              Use my location
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-6">Enter the weather conditions you want to check. You can use approximate values.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Temperature */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Thermometer className="h-4 w-4 text-red-500" aria-hidden="true" /> Temperature
              </label>
              <input
                type="number"
                value={form.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                min={-10} max={50} step={0.1}
                placeholder="e.g., 32 (in Celsius)"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Mosquitoes are most active between 25-35 C</p>
            </div>

            {/* Humidity */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Droplets className="h-4 w-4 text-blue-500" aria-hidden="true" /> Humidity
              </label>
              <input
                type="number"
                value={form.humidity}
                onChange={(e) => handleChange('humidity', e.target.value)}
                min={0} max={100} step={0.1}
                placeholder="e.g., 75 (percentage)"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Higher humidity = more mosquito breeding</p>
            </div>

            {/* Rainfall */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <CloudLightning className="h-4 w-4 text-indigo-500" aria-hidden="true" /> Monthly Rainfall
              </label>
              <input
                type="number"
                value={form.rainfall}
                onChange={(e) => handleChange('rainfall', e.target.value)}
                min={0} max={500} step={0.1}
                placeholder="e.g., 200 (in mm)"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Standing water from rain is a primary breeding ground</p>
            </div>

            {/* Month */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
              <select
                value={form.month}
                onChange={(e) => handleChange('month', e.target.value)}
                className="input-field"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-green-500" aria-hidden="true" /> What kind of climate are you in?
              </label>
              <div className="space-y-2">
                {REGIONS.map((r) => (
                  <label
                    key={r.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.region_type === r.key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="region"
                      value={r.key}
                      checked={form.region_type === r.key}
                      onChange={(e) => handleChange('region_type', e.target.value)}
                      className="accent-primary-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Checking conditions...</>
              ) : (
                <><CloudRain className="h-4 w-4" /> Check Disease Risk</>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6" ref={resultsRef}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Export */}
              <div className="flex justify-end">
                <ExportButton targetRef={resultsRef} filename="weather-disease-alert" />
              </div>

              {/* Season Alert */}
              <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-amber-800">{results.season_alert}</p>
                </div>
              </div>

              {/* Risk Chart */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Risk at a Glance</h3>
                <p className="text-sm text-gray-400 mb-4">How likely are these diseases given the current conditions?</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#6b7280' }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: '#374151' }} />
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} />
                    <Bar dataKey="risk" radius={[0, 6, 6, 0]} barSize={24}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Disease Cards */}
              {results.risks.map((risk, i) => {
                const colors = getRiskColor(risk.risk_level);
                return (
                  <div key={risk.disease} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{risk.disease}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                        {risk.risk_level}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Risk Score</span>
                        <span className="font-semibold">{(risk.risk_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${risk.risk_score * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-2.5 rounded-full"
                          style={{ backgroundColor: colors.bar }}
                        />
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Why is risk {risk.risk_level.toLowerCase()}?
                      </p>
                      <ul className="space-y-1">
                        {risk.contributing_factors.map((f, j) => (
                          <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5" aria-hidden="true">*</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention Tips */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        How to protect yourself
                      </p>
                      <ul className="space-y-1">
                        {risk.prevention_tips.map((t, j) => (
                          <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                            <Shield className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" aria-hidden="true" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!results && !error && (
            <div className="card text-center text-gray-400 py-16">
              <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No weather data yet</h3>
              <p className="text-sm max-w-xs mx-auto">
                Enter the weather conditions on the left to see how they affect disease risk in your region.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <Heart className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-amber-800 text-sm font-medium mb-1">Keep in mind</p>
          <p className="text-amber-700 text-sm">
            Weather is just one piece of the puzzle. Actual disease outbreaks depend on many more factors --
            local healthcare infrastructure, vaccination coverage, sanitation, and population immunity.
            Use this as awareness, not action. When in doubt, check with local health authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
