import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  CloudRain,
  Clock,
  Trash2,
  ArrowRight,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import useStore from '../store/useStore';

const TYPE_CONFIG = {
  symptom: {
    icon: Stethoscope,
    label: 'Symptom Check',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  risk: {
    icon: HeartPulse,
    label: 'Risk Assessment',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  weather: {
    icon: CloudRain,
    label: 'Weather Alert',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
};

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const { history, clearHistory, removeFromHistory } = useStore();
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((h) => h.type === filter);

  const stats = {
    total: history.length,
    symptoms: history.filter((h) => h.type === 'symptom').length,
    risk: history.filter((h) => h.type === 'risk').length,
    weather: history.filter((h) => h.type === 'weather').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-primary-50 rounded-xl">
            <LayoutDashboard className="h-7 w-7 text-primary-600" />
          </div>
          <div>
            <h1 className="section-title !mb-0">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Your health prediction history, all in one place
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Checks', value: stats.total, icon: Activity },
          { label: 'Symptom Checks', value: stats.symptoms, icon: Stethoscope },
          { label: 'Risk Assessments', value: stats.risk, icon: HeartPulse },
          { label: 'Weather Alerts', value: stats.weather, icon: CloudRain },
        ].map((s) => (
          <div key={s.label} className="card text-center !p-4">
            <s.icon className="h-5 w-5 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/symptoms', icon: Stethoscope, label: 'Check Symptoms', color: 'text-blue-600', bg: 'bg-blue-50' },
          { to: '/risk', icon: HeartPulse, label: 'Assess Risk', color: 'text-rose-600', bg: 'bg-rose-50' },
          { to: '/weather', icon: CloudRain, label: 'Weather Alerts', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="card flex items-center gap-3 hover:scale-[1.02] transition-transform !p-4"
          >
            <div className={`p-2 rounded-xl ${action.bg}`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">{action.label}</span>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>
        ))}
      </div>

      {/* History Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Prediction History
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all prediction history?')) clearHistory();
              }}
              className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Filter tabs */}
        {history.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'symptom', label: 'Symptoms' },
              { key: 'risk', label: 'Risk' },
              { key: 'weather', label: 'Weather' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {history.length === 0 ? 'No predictions yet' : 'No results for this filter'}
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              {history.length === 0
                ? 'Your prediction history will appear here after you use any of the tools. All data stays in your browser.'
                : 'Try a different filter or make a new prediction.'}
            </p>
            {history.length === 0 && (
              <Link to="/symptoms" className="btn-primary inline-flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Start Your First Check
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredHistory.map((entry) => {
                const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.symptom;
                const Icon = config.icon;
                const isExpanded = expandedId === entry.id;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`card border-2 ${config.border} !p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${config.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                          {entry.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => removeFromHistory(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && entry.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
                        >
                          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
                            {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
