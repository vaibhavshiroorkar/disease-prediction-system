import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Select from 'react-select';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  Lightbulb,
  XCircle,
  Heart,
  Download,
} from 'lucide-react';
import { getMetadata, predictFromSymptoms } from '../api/axios';
import useStore from '../store/useStore';
import ExportButton from '../components/ui/ExportButton';

const LOADING_MESSAGES = [
  'Analyzing your symptoms...',
  'Cross-referencing 41 conditions...',
  'Almost there...',
];

const TIPS = [
  'Tip: The more symptoms you add, the more accurate the prediction becomes.',
  'Tip: Try to be as specific as possible -- "sharp chest pain" is more helpful than just "pain."',
  "Tip: Don't panic. Many conditions share similar symptoms. This tool is a starting point, not a diagnosis.",
];

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const resultsRef = useRef(null);
  const { addToHistory } = useStore();

  // Fuzzy search instance
  const fuse = useMemo(() => {
    if (symptoms.length === 0) return null;
    return new Fuse(symptoms, {
      keys: ['label'],
      threshold: 0.4,
      distance: 100,
    });
  }, [symptoms]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const loadMetadata = async () => {
    try {
      const data = await getMetadata();
      const options = data.symptom_keys.map((key, i) => ({
        value: key,
        label: data.symptoms[i],
      }));
      setSymptoms(options);
    } catch {
      setError("We couldn't load the symptom list. Is the backend server running?");
      toast.error('Failed to load symptom data');
    }
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length < 2) {
      setError('Please select at least 2 symptoms so the AI has enough to work with.');
      toast.error('Select at least 2 symptoms');
      return;
    }

    setLoading(true);
    setLoadingMsg(0);
    setError('');
    setPredictions(null);

    try {
      const symptomKeys = selectedSymptoms.map((s) => s.value);
      const data = await predictFromSymptoms(symptomKeys);
      setPredictions(data);
      toast.success(`Found ${data.predictions.length} possible conditions`);

      // Save to history
      addToHistory({
        type: 'symptom',
        summary: `${selectedSymptoms.length} symptoms → Top: ${data.predictions[0]?.disease || 'Unknown'}`,
        details: {
          symptoms: selectedSymptoms.map((s) => s.label),
          topPrediction: data.predictions[0]?.disease,
          confidence: data.predictions[0]?.confidence,
          totalResults: data.predictions.length,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong. Let's try that again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedSymptoms([]);
    setPredictions(null);
    setError('');
  };

  // Custom filter with fuzzy matching
  const filterOption = (option, inputValue) => {
    if (!inputValue) return true;
    if (fuse) {
      const results = fuse.search(inputValue);
      return results.some((r) => r.item.value === option.value);
    }
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-red-600 bg-red-50';
    if (confidence >= 0.4) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getConfidenceBarColor = (confidence) => {
    if (confidence >= 0.7) return 'bg-red-500';
    if (confidence >= 0.4) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.7) return 'Strong match';
    if (confidence >= 0.4) return 'Possible match';
    return 'Unlikely';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Symptom Checker — MediPredict AI</title>
        <meta name="description" content="AI-powered symptom checker. Select symptoms and get instant disease predictions with confidence scores." />
      </Helmet>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Stethoscope className="h-7 w-7 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="section-title !mb-0">Symptom Checker</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tell us what you're feeling, and we'll help you understand what it could mean.
            </p>
          </div>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-blue-700 text-sm">{TIPS[tipIndex]}</p>
      </div>

      {/* Symptom Selector */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          What are you experiencing?
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Start typing to search from {symptoms.length > 0 ? symptoms.length : '130+'} recognized symptoms.
        </p>

        <Select
          isMulti
          options={symptoms}
          value={selectedSymptoms}
          onChange={setSelectedSymptoms}
          placeholder="e.g., headache, fever, fatigue..."
          className="mb-4"
          classNamePrefix="symptom-select"
          noOptionsMessage={() => "Hmm, we don't recognize that one. Try different wording."}
          filterOption={filterOption}
          aria-label="Symptom selector"
        />

        {selectedSymptoms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSymptoms.map((s) => (
              <span key={s.value} className="badge bg-primary-100 text-primary-700">
                {s.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
              {selectedSymptoms.length > 0 && selectedSymptoms.length < 2 && (
                <span className="text-amber-500 ml-1">(add 1 more)</span>
              )}
            </span>
            {selectedSymptoms.length > 0 && (
              <button
                onClick={handleClear}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>
          <button
            onClick={handlePredict}
            disabled={loading || selectedSymptoms.length < 2}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {LOADING_MESSAGES[loadingMsg]}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Analyze Symptoms
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!predictions && !loading && !error && selectedSymptoms.length === 0 && (
        <div className="card text-center py-16">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-200" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No symptoms selected yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Use the search above to describe how you're feeling. Select at least 2 symptoms,
            and the AI will suggest possible conditions.
          </p>
        </div>
      )}

      {/* Results */}
      {predictions && (
        <div ref={resultsRef}>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Here's what we found</h2>
              <p className="text-sm text-gray-500 mt-1">
                Based on your {selectedSymptoms.length} symptoms, ranked by likelihood
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton targetRef={resultsRef} filename="symptom-prediction" label="Export" />
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                Model accuracy: {(predictions.model_accuracy * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {predictions.predictions.map((pred, index) => (
              <div key={pred.disease} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-sm font-bold text-gray-400">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {pred.disease}
                      </h3>
                      <p className="text-sm text-gray-500">{pred.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold ${getConfidenceColor(pred.confidence)}`}
                    >
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{getConfidenceLabel(pred.confidence)}</p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pred.confidence * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-2.5 rounded-full ${getConfidenceBarColor(pred.confidence)}`}
                  />
                </div>

                {/* Matching Symptoms */}
                {pred.matching_symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Why this prediction? These symptoms matched:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pred.matching_symptoms.map((s) => (
                        <span key={s} className="flex items-center gap-1 badge bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <Heart className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-amber-800 text-sm font-medium mb-1">
                A friendly reminder
              </p>
              <p className="text-amber-700 text-sm">
                These results are AI-generated suggestions, not a medical diagnosis.
                They're meant to help you have a more informed conversation with your doctor --
                not replace one. If you're experiencing severe symptoms, please seek medical attention right away.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
