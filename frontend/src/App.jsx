import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Activity, History, LineChart, AlertTriangle } from 'lucide-react';
import PredictionForm from './components/PredictionForm';
import RiskGauge from './components/RiskGauge';
import HistoryTable from './components/HistoryTable';
import RiskChart from './components/RiskChart';

// Use environment variable in production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
    const [prediction, setPrediction] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch prediction history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/predictions`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data.predictions);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const handlePredict = async (formData) => {
        setLoading(true);
        const toastId = toast.loading("Analyzing epidemiological data...");

        // Render Free Tier cold start warning
        const timeoutId = setTimeout(() => {
            toast.info("Server is waking up...", { description: "Render Free Tier may take up to 60s." });
        }, 3000);

        try {
            const response = await fetch(`${API_URL}/predict_outbreak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Server Error (${response.status})`);
            }

            const data = await response.json();
            setPrediction(data);
            toast.success("Prediction Complete", { id: toastId });

            // Refresh history
            await fetchHistory();
        } catch (err) {
            clearTimeout(timeoutId);
            console.error(err);
            toast.error("Prediction Failed", {
                id: toastId,
                description: err.message || 'Connection failed. Is the backend running?'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-slate-200 p-4 md:p-8">
            <Toaster position="top-right" theme="dark" richColors />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto mb-10 text-center md:text-left"
            >
                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-800/50 pb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent mb-2">
                            BioGuard AI
                        </h1>
                        <p className="text-slate-400 text-lg">Advanced Multi-Disease Outbreak Prediction System</p>
                    </div>
                </div>
            </motion.header>

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Top Section: Form + Risk Gauge */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Prediction Form - Takes up 7 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-7 glass-card p-6 md:p-8"
                    >
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-cyan-300">
                            <AlertTriangle className="w-5 h-5" />
                            Input Parameters
                        </h2>
                        <PredictionForm onSubmit={handlePredict} loading={loading} />
                    </motion.div>

                    {/* Risk Gauge - Takes up 5 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 glass-card p-6 md:p-8 flex flex-col"
                    >
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-orange-300">
                            <Activity className="w-5 h-5" />
                            Risk Analysis
                        </h2>
                        <div className="flex-1 flex items-center justify-center">
                            <RiskGauge prediction={prediction} />
                        </div>
                    </motion.div>
                </div>

                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 md:p-8"
                >
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-300">
                        <LineChart className="w-5 h-5" />
                        Risk Trend Analysis
                    </h2>
                    <RiskChart history={history} />
                </motion.div>

                {/* History Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 md:p-8"
                >
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-300">
                        <History className="w-5 h-5" />
                        Analysis History
                    </h2>
                    <HistoryTable history={history} onRefresh={fetchHistory} />
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto mt-16 text-center border-t border-slate-800/50 pt-8 text-slate-500 text-sm">
                <p>BioGuard AI • Powered by Random Forest & Open-Meteo • Phase 2 Beta</p>
            </footer>
        </div>
    );
}

export default App;
