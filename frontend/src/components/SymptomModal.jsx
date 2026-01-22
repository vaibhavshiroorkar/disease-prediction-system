import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Stethoscope, MapPin } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Common symptoms checklist
const SYMPTOM_OPTIONS = [
    { id: 'fever', label: 'Fever', category: 'general' },
    { id: 'headache', label: 'Headache', category: 'general' },
    { id: 'fatigue', label: 'Fatigue / Weakness', category: 'general' },
    { id: 'joint pain', label: 'Joint Pain', category: 'dengue' },
    { id: 'muscle pain', label: 'Muscle Pain', category: 'dengue' },
    { id: 'rash', label: 'Skin Rash', category: 'dengue' },
    { id: 'nausea', label: 'Nausea / Vomiting', category: 'general' },
    { id: 'chills', label: 'Chills / Sweating', category: 'malaria' },
    { id: 'cough', label: 'Cough', category: 'viral' },
    { id: 'sore throat', label: 'Sore Throat', category: 'viral' },
];

function SymptomModal({ regions, selectedRegion, onClose }) {
    const [step, setStep] = useState(1);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState(selectedRegion?.id || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSymptomToggle = (symptomId) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptomId)
                ? prev.filter(s => s !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleSubmit = async () => {
        if (!selectedRegionId || selectedSymptoms.length === 0) {
            setError('Please select a region and at least one symptom');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/triage/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region_id: parseInt(selectedRegionId),
                    symptoms: selectedSymptoms
                })
            });

            if (!response.ok) {
                throw new Error('Triage check failed');
            }

            const data = await response.json();
            setResult(data);
            setStep(2);
        } catch (err) {
            console.error('Triage error:', err);
            // Demo response for development
            setResult({
                region_name: regions.find(r => r.id === parseInt(selectedRegionId))?.name || 'Unknown',
                regional_threat_level: 'MODERATE',
                symptoms_reported: selectedSymptoms,
                urgency_level: 'ELEVATED',
                recommendation: 'Your symptoms warrant medical attention. Please consult a healthcare provider within 24-48 hours. Monitor for worsening symptoms.',
                context_warning: 'Your region is experiencing moderate outbreak risk. Take preventive measures.'
            });
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyStyles = (level) => {
        switch (level) {
            case 'URGENT':
                return {
                    bg: 'bg-red-500/20',
                    border: 'border-red-500',
                    text: 'text-red-400',
                    icon: AlertTriangle
                };
            case 'ELEVATED':
                return {
                    bg: 'bg-amber-500/20',
                    border: 'border-amber-500',
                    text: 'text-amber-400',
                    icon: AlertTriangle
                };
            default:
                return {
                    bg: 'bg-green-500/20',
                    border: 'border-green-500',
                    text: 'text-green-400',
                    icon: CheckCircle
                };
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sentinel-500/20 rounded-lg">
                            <Stethoscope className="w-6 h-6 text-sentinel-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Symptom Triage</h2>
                            <p className="text-sm text-zinc-400">Context-aware health analysis</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {step === 1 ? (
                    /* Step 1: Input Form */
                    <div className="space-y-6">
                        {/* Region Selection */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Your Location
                            </label>
                            <select
                                value={selectedRegionId}
                                onChange={(e) => setSelectedRegionId(e.target.value)}
                                className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-xl text-white focus:ring-2 focus:ring-sentinel-500 focus:border-transparent transition-all"
                            >
                                <option value="">Select your region...</option>
                                {regions.map(region => (
                                    <option key={region.id} value={region.id}>
                                        {region.name} {region.threat_level === 'HIGH' && '⚠️'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Symptom Checkboxes */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-3">
                                Select your symptoms:
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {SYMPTOM_OPTIONS.map(symptom => (
                                    <label
                                        key={symptom.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSymptoms.includes(symptom.id)
                                                ? 'bg-sentinel-500/20 border-sentinel-500 text-white'
                                                : 'bg-dark-600 border-dark-500 text-zinc-300 hover:border-dark-400'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSymptoms.includes(symptom.id)}
                                            onChange={() => handleSymptomToggle(symptom.id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedSymptoms.includes(symptom.id)
                                                ? 'bg-sentinel-500 border-sentinel-500'
                                                : 'border-zinc-500'
                                            }`}>
                                            {selectedSymptoms.includes(symptom.id) && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm">{symptom.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedRegionId || selectedSymptoms.length === 0}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Stethoscope className="w-5 h-5" />
                                    Get Recommendation
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Step 2: Results */
                    <div className="space-y-6">
                        {result && (
                            <>
                                {/* Urgency Alert */}
                                {(() => {
                                    const styles = getUrgencyStyles(result.urgency_level);
                                    const Icon = styles.icon;
                                    return (
                                        <div className={`p-4 rounded-xl ${styles.bg} border ${styles.border}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className={`w-6 h-6 ${styles.text}`} />
                                                <span className={`font-bold text-lg ${styles.text}`}>
                                                    {result.urgency_level} Priority
                                                </span>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed">
                                                {result.recommendation}
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Context Warning */}
                                {result.context_warning && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="text-blue-300 text-sm flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {result.context_warning}
                                        </p>
                                    </div>
                                )}

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-dark-600 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Location</p>
                                        <p className="text-white font-medium">{result.region_name}</p>
                                    </div>
                                    <div className="p-3 bg-dark-600 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Regional Threat</p>
                                        <span className={`status-${result.regional_threat_level.toLowerCase()}`}>
                                            {result.regional_threat_level}
                                        </span>
                                    </div>
                                </div>

                                {/* Reported Symptoms */}
                                <div>
                                    <p className="text-xs text-zinc-500 mb-2">Symptoms Reported:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.symptoms_reported.map(symptom => (
                                            <span
                                                key={symptom}
                                                className="px-3 py-1 bg-dark-600 rounded-full text-sm text-zinc-300"
                                            >
                                                {symptom}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setResult(null);
                                            setSelectedSymptoms([]);
                                        }}
                                        className="flex-1 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-xl transition-colors"
                                    >
                                        Check Again
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 btn-primary"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SymptomModal;
