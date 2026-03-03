import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  HeartPulse,
  Loader2,
  AlertTriangle,
  Shield,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Heart,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  assessDiabetesRisk,
  assessHeartRisk,
  assessStrokeRisk,
} from '../api/axios';
import useStore from '../store/useStore';
import ExportButton from '../components/ui/ExportButton';

const TABS = [
  { key: 'diabetes', label: 'Diabetes', desc: 'Blood sugar & metabolism' },
  { key: 'heart', label: 'Heart Disease', desc: 'Cardiovascular health' },
  { key: 'stroke', label: 'Stroke', desc: 'Brain & blood flow' },
];

const FIELD_CONFIG = {
  diabetes: [
    { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g., 45', hint: 'Your current age in years' },
    { name: 'glucose', label: 'Glucose Level (mg/dL)', type: 'number', min: 50, max: 250, placeholder: 'e.g., 120', hint: 'Fasting blood glucose. Normal: 70-100 mg/dL' },
    { name: 'blood_pressure', label: 'Blood Pressure (mmHg)', type: 'number', min: 40, max: 200, placeholder: 'e.g., 80', hint: 'Diastolic (bottom number). Normal: < 80 mmHg' },
    { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1, placeholder: 'e.g., 28.5', hint: 'Body Mass Index. Normal: 18.5 - 24.9' },
    { name: 'insulin', label: 'Insulin (mu U/ml)', type: 'number', min: 0, max: 800, placeholder: 'e.g., 85', hint: 'Fasting insulin level. Normal: 2-25 mu U/ml' },
    { name: 'pregnancies', label: 'Pregnancies', type: 'number', min: 0, max: 20, placeholder: 'e.g., 2', hint: 'Total number of pregnancies' },
    { name: 'skin_thickness', label: 'Skin Thickness (mm)', type: 'number', min: 0, max: 100, placeholder: 'e.g., 25', hint: 'Triceps skinfold thickness. Normal: 10-50 mm' },
    { name: 'diabetes_pedigree', label: 'Diabetes Pedigree Function', type: 'number', min: 0, max: 3, step: 0.01, placeholder: 'e.g., 0.5', hint: 'Family history score (0-2.5). Higher = stronger family history' },
  ],
  heart: [
    { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g., 55', hint: 'Your current age in years' },
    { name: 'sex', label: 'Sex', type: 'select', options: [{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }], hint: 'Biological sex at birth' },
    { name: 'chest_pain_type', label: 'Chest Pain Type', type: 'select', options: [{ value: 0, label: 'Typical Angina' }, { value: 1, label: 'Atypical Angina' }, { value: 2, label: 'Non-Anginal Pain' }, { value: 3, label: 'Asymptomatic' }], hint: 'Type of chest pain experienced, if any' },
    { name: 'resting_bp', label: 'Resting Blood Pressure (mmHg)', type: 'number', min: 60, max: 250, placeholder: 'e.g., 130', hint: 'Systolic (top number). Normal: < 120 mmHg' },
    { name: 'cholesterol', label: 'Cholesterol (mg/dL)', type: 'number', min: 100, max: 600, placeholder: 'e.g., 240', hint: 'Total cholesterol. Desirable: < 200 mg/dL' },
    { name: 'max_heart_rate', label: 'Max Heart Rate (bpm)', type: 'number', min: 60, max: 220, placeholder: 'e.g., 150', hint: 'Max during exercise. Estimate: 220 minus your age' },
    { name: 'exercise_angina', label: 'Exercise-Induced Angina', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }], hint: 'Chest pain during physical activity?' },
    { name: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number', min: 0, max: 10, step: 0.1, placeholder: 'e.g., 1.5', hint: 'From ECG test. Normal: 0. Ask your doctor if unsure' },
    { name: 'fasting_blood_sugar', label: 'Fasting Blood Sugar > 120', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }], hint: 'Is your fasting blood sugar above 120 mg/dL?' },
    { name: 'resting_ecg', label: 'Resting ECG', type: 'select', options: [{ value: 0, label: 'Normal' }, { value: 1, label: 'ST-T Abnormality' }, { value: 2, label: 'LV Hypertrophy' }], hint: 'Results from resting ECG test' },
    { name: 'slope', label: 'ST Slope', type: 'select', options: [{ value: 0, label: 'Upsloping' }, { value: 1, label: 'Flat' }, { value: 2, label: 'Downsloping' }], hint: 'Peak exercise ST segment slope (from stress test)' },
  ],
  stroke: [
    { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g., 60', hint: 'Your current age in years' },
    { name: 'sex', label: 'Sex', type: 'select', options: [{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }], hint: 'Biological sex at birth' },
    { name: 'hypertension', label: 'Hypertension', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }], hint: 'Have you been diagnosed with high blood pressure?' },
    { name: 'heart_disease', label: 'Heart Disease History', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }], hint: 'Any previous heart conditions?' },
    { name: 'avg_glucose_level', label: 'Avg Glucose Level (mg/dL)', type: 'number', min: 50, max: 300, placeholder: 'e.g., 105', hint: 'Average blood glucose. Normal: 70-100 mg/dL' },
    { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1, placeholder: 'e.g., 28.5', hint: 'Body Mass Index. Normal: 18.5 - 24.9' },
    { name: 'smoking_status', label: 'Smoking Status', type: 'select', options: [{ value: 0, label: 'Never Smoked' }, { value: 1, label: 'Former Smoker' }, { value: 2, label: 'Currently Smokes' }], hint: 'Your smoking history' },
  ],
};

const STEP_SIZE = 3;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const getRiskColor = (level) => {
  switch (level) {
    case 'High':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        bar: 'bg-red-500',
        emoji: 'Please take this seriously',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        bar: 'bg-amber-500',
        emoji: 'Worth keeping an eye on',
      };
    default:
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        bar: 'bg-green-500',
        emoji: 'Looking good!',
      };
  }
};

function validateField(field, value) {
  if (value === '' || value === undefined || value === null) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Please enter a valid number';
  if (field.min !== undefined && num < field.min) return `Minimum value is ${field.min}`;
  if (field.max !== undefined && num > field.max) return `Maximum value is ${field.max}`;
  return null;
}

export default function RiskAssessment() {
  const [activeTab, setActiveTab] = useState('diabetes');
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showHints, setShowHints] = useState(true);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState({});
  const resultsRef = useRef(null);
  const { addToHistory } = useStore();

  const fields = FIELD_CONFIG[activeTab] || [];
  const steps = useMemo(() => chunkArray(fields, STEP_SIZE), [activeTab]);
  const totalSteps = steps.length;
  const currentFields = steps[step] || [];
  const isLastStep = step === totalSteps - 1;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getFieldError = (field) => {
    if (!touched[field.name]) return null;
    return validateField(field, formData[field.name]);
  };

  const isStepValid = () => {
    return currentFields.every((field) => {
      const val = formData[field.name];
      if (val === '' || val === undefined || val === null) return false;
      if (field.type === 'number') {
        const err = validateField(field, val);
        return !err;
      }
      return true;
    });
  };

  const nextStep = () => {
    const newTouched = { ...touched };
    currentFields.forEach((f) => (newTouched[f.name] = true));
    setTouched(newTouched);

    if (!isStepValid()) {
      toast.error('Please fill in all fields correctly before proceeding.');
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTouched = {};
    fields.forEach((f) => (newTouched[f.name] = true));
    setTouched(newTouched);

    if (!isStepValid()) {
      toast.error('Please fill in all fields correctly.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const cleanData = {};
      for (const [key, val] of Object.entries(formData)) {
        cleanData[key] = typeof val === 'string' ? parseFloat(val) : val;
      }

      let data;
      switch (activeTab) {
        case 'diabetes':
          data = await assessDiabetesRisk(cleanData);
          break;
        case 'heart':
          data = await assessHeartRisk(cleanData);
          break;
        case 'stroke':
          data = await assessStrokeRisk(cleanData);
          break;
      }
      setResults(data);
      setExpandedSection('factors');

      const result = data?.results?.[0];
      if (result) {
        toast.success(`Assessment complete — ${result.risk_level} risk detected.`);
        addToHistory({
          type: 'risk',
          label: `${TABS.find((t) => t.key === activeTab)?.label} Risk`,
          result: `${result.risk_level} (${(result.risk_score * 100).toFixed(1)}%)`,
          details: { tab: activeTab, risk_level: result.risk_level, risk_score: result.risk_score, confidence: result.confidence },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "We couldn't process that. Double-check your inputs and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabChanged = (key) => {
    setActiveTab(key);
    setFormData({});
    setResults(null);
    setError('');
    setStep(0);
    setTouched({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Health Risk Assessment | MediPredict AI</title>
        <meta name="description" content="Assess your risk for diabetes, heart disease, and stroke using AI-powered models." />
      </Helmet>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-rose-50 rounded-xl">
            <HeartPulse className="h-7 w-7 text-rose-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="section-title !mb-0">Health Risk Assessment</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your health numbers and let AI evaluate your risk -- with clear explanations
            </p>
          </div>
        </div>
      </div>

      {/* Context Banner */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-rose-700 text-sm">
          Don't know some of these numbers? That's okay -- you can find most of them on a recent blood test or checkup report. Skip what you don't know by entering a typical value.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2" role="tablist" aria-label="Assessment type">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => tabChanged(tab.key)}
            className={`flex flex-col items-start px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs font-normal mt-0.5 ${activeTab === tab.key ? 'text-primary-200' : 'text-gray-400'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Your Health Parameters
            </h2>
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {showHints ? 'Hide' : 'Show'} hints
            </button>
          </div>

          {/* Step Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {currentFields.map((field) => {
                  const fieldError = getFieldError(field);
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleChange(field.name, parseInt(e.target.value))}
                          onBlur={() => setTouched((p) => ({ ...p, [field.name]: true }))}
                          className={`input-field ${fieldError ? '!border-red-500 !ring-red-500' : ''}`}
                          required
                        >
                          <option value="">Select...</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          onBlur={() => setTouched((p) => ({ ...p, [field.name]: true }))}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          placeholder={field.placeholder}
                          className={`input-field ${fieldError ? '!border-red-500 !ring-red-500' : ''}`}
                          required
                        />
                      )}
                      {fieldError && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {fieldError}
                        </p>
                      )}
                      {!fieldError && showHints && field.hint && (
                        <p className="text-xs text-gray-400 mt-1">{field.hint}</p>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Step Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {isLastStep ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Crunching the numbers...</>
                  ) : (
                    <><TrendingUp className="h-4 w-4" /> Assess My Risk</>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div ref={resultsRef}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="mb-4 flex justify-end">
              <ExportButton targetRef={resultsRef} filename={`risk-assessment-${activeTab}`} />
            </div>
          )}

          {results && results.results.map((result, i) => {
            const colors = getRiskColor(result.risk_level);
            return (
              <div key={i} className="space-y-6">
                {/* Risk Score Card */}
                <div className={`card ${colors.border} border-2`}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.disease} Risk
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-bold ${colors.bg} ${colors.text}`}>
                      {result.risk_level}
                    </div>
                    <p className="text-sm text-gray-400 mt-2 italic">{colors.emoji}</p>
                  </div>

                  {/* Score Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Risk Score</span>
                      <span className="font-semibold">{(result.risk_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.risk_score * 100}%` }}
                        transition={{ duration: 1 }}
                        className={`h-3 rounded-full ${colors.bar}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    Model confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Risk Factors */}
                <div className="card">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'factors' ? null : 'factors')}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                      What's driving this score?
                    </h3>
                    {expandedSection === 'factors' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'factors' && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2 overflow-hidden"
                      >
                        {result.risk_factors.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-amber-500 mt-1" aria-hidden="true">*</span> {f}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Recommendations */}
                <div className="card">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'recs' ? null : 'recs')}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-500" aria-hidden="true" />
                      What you can do about it
                    </h3>
                    {expandedSection === 'recs' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'recs' && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2 overflow-hidden"
                      >
                        {result.recommendations.map((r, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" /> {r}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {!results && !error && (
            <div className="card text-center text-gray-400 py-16">
              <HeartPulse className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Your results will appear here</h3>
              <p className="text-sm max-w-xs mx-auto">
                Fill in your health parameters on the left and click "Assess My Risk" to see a detailed breakdown.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <Heart className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-amber-800 text-sm font-medium mb-1">Important to know</p>
          <p className="text-amber-700 text-sm">
            This assessment is for learning and awareness only. It uses statistical models trained on research datasets --
            your actual risk depends on many factors a computer can't measure. Please share your results with a doctor for real medical guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
