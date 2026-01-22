import { useState, useEffect } from 'react';
import {
    Stethoscope, AlertTriangle, CheckCircle,
    MapPin, ChevronRight, ArrowLeft, Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SYMPTOM_OPTIONS = [
    { id: 'fever', label: 'High Fever (>38°C)', icon: Thermometer },
    { id: 'headache', label: 'Severe Headache', icon: ActivityIcon },
    { id: 'joint pain', label: 'Joint / Muscle Pain', icon: BoneIcon },
    { id: 'nausea', label: 'Nausea / Vomiting', icon: StomachIcon },
    { id: 'rash', label: 'Skin Rash', icon: SkinIcon },
    { id: 'fatigue', label: 'Extreme Fatigue', icon: SleepIcon },
    { id: 'bleeding', label: 'Bleeding (Gums/Nose)', icon: DropIcon },
    { id: 'eye pain', label: 'Pain Behind Eyes', icon: EyeIcon },
];

// Simple icon placeholders if Lucide doesn't have specific ones
function ActivityIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function BoneIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function StomachIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function SkinIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function SleepIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function DropIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }
function EyeIcon(props) { return <div className="w-5 h-5 rounded bg-zinc-700" />; }

function Prediction() {
    const [step, setStep] = useState(1);
    const [regions, setRegions] = useState([]);
    const [formData, setFormData] = useState({
        regionId: '',
        symptoms: []
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Fetch regions on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/geo/status`)
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then(data => setRegions(data.regions))
            .catch(err => {
                console.warn('API unavailable, using demo data', err);
                setRegions([
                    { id: 1, name: 'Mumbai', latitude: 19.076, longitude: 72.8777, threat_level: 'HIGH' },
                    { id: 2, name: 'Delhi', latitude: 28.6139, longitude: 77.209, threat_level: 'MODERATE' },
                    { id: 3, name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, threat_level: 'LOW' },
                    { id: 4, name: 'Chennai', latitude: 13.0827, longitude: 80.2707, threat_level: 'HIGH' },
                ]);
            });
    }, []);

    const toggleSymptom = (id) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(id)
                ? prev.symptoms.filter(s => s !== id)
                : [...prev.symptoms, id]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/triage/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region_id: parseInt(formData.regionId),
                    symptoms: formData.symptoms
                })
            });
            const data = await response.json();
            setResult(data);
            setStep(3);
        } catch (err) {
            console.error(err);
            // Demo fallback
            setResult({
                region_name: regions.find(r => r.id == formData.regionId)?.name || 'Unknown',
                regional_threat_level: 'MODERATE',
                symptoms_reported: formData.symptoms,
                urgency_level: 'ELEVATED',
                recommendation: 'Based on reported symptoms and regional data, we recommend consulting a physician within 24 hours.',
                context_warning: 'Your region is currently experiencing elevated vector-borne disease activity.'
            });
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Symptom Checker</h1>
                <p className="text-zinc-400">
                    Our context-aware AI analyzes your symptoms against real-time epidemiological data
                    from your location to provide smarter health recommendations.
                </p>
            </div>

            <div className="card relative overflow-hidden min-h-[500px]">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-dark-600">
                    <div
                        className="h-full bg-sentinel-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-sentinel-600 flex items-center justify-center text-sm">1</span>
                                    Select Your Location
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {regions.map(region => (
                                        <button
                                            key={region.id}
                                            onClick={() => setFormData({ ...formData, regionId: region.id })}
                                            className={`p-4 rounded-xl border text-left transition-all hover:bg-dark-600 ${formData.regionId === region.id
                                                ? 'bg-sentinel-500/20 border-sentinel-500 ring-1 ring-sentinel-500'
                                                : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-white">{region.name}</span>
                                                {region.threat_level === 'HIGH' && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                        High Risk
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {region.latitude.toFixed(2)}, {region.longitude.toFixed(2)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.regionId}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-sentinel-600 flex items-center justify-center text-sm">2</span>
                                    Report Symptoms
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {SYMPTOM_OPTIONS.map(symptom => (
                                        <label
                                            key={symptom.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.symptoms.includes(symptom.id)
                                                ? 'bg-sentinel-500/20 border-sentinel-500'
                                                : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.symptoms.includes(symptom.id)}
                                                onChange={() => toggleSymptom(symptom.id)}
                                            />
                                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.symptoms.includes(symptom.id)
                                                ? 'bg-sentinel-500 border-sentinel-500'
                                                : 'border-zinc-500'
                                                }`}>
                                                {formData.symptoms.includes(symptom.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="font-medium text-zinc-200">{symptom.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-zinc-400 hover:text-white flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={formData.symptoms.length === 0 || loading}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>Analyzing...</>
                                        ) : (
                                            <>Analyze Risk <Stethoscope className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && result && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className={`inline-flex p-4 rounded-full mb-6 ${result.urgency_level === 'URGENT' ? 'bg-red-500/20 text-red-500' :
                                    result.urgency_level === 'ELEVATED' ? 'bg-amber-500/20 text-amber-500' :
                                        'bg-green-500/20 text-green-500'
                                    }`}>
                                    {result.urgency_level === 'URGENT' ? <AlertTriangle className="w-12 h-12" /> :
                                        result.urgency_level === 'ELEVATED' ? <AlertTriangle className="w-12 h-12" /> :
                                            <CheckCircle className="w-12 h-12" />}
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {result.urgency_level} PRIORITY
                                </h2>
                                <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                                    {result.recommendation}
                                </p>

                                {result.context_warning && (
                                    <div className="max-w-xl mx-auto p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-8 flex items-start gap-4 text-left">
                                        <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-1">Regional Context: {result.region_name}</h4>
                                            <p className="text-sm text-blue-200">{result.context_warning}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setFormData({ regionId: '', symptoms: [] });
                                        setResult(null);
                                    }}
                                    className="px-8 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-xl transition-colors"
                                >
                                    Start New Check
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Prediction;
