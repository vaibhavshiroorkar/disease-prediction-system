import { useState, useEffect } from 'react';
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
    const [error, setError] = useState(null);

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
        setError(null);

        try {
            const response = await fetch(`${API_URL}/predict_outbreak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Prediction failed. Make sure the backend is running.');
            }

            const data = await response.json();
            setPrediction(data);

            // Refresh history
            await fetchHistory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Dengue Outbreak Predictor
                        </h1>
                        <p className="text-slate-400 text-sm">AI-powered disease outbreak risk assessment</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {/* Top Section: Form + Risk Gauge */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Prediction Form */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Enter Environmental Data
                        </h2>
                        <PredictionForm onSubmit={handlePredict} loading={loading} />
                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Risk Gauge */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Risk Assessment
                        </h2>
                        <RiskGauge prediction={prediction} />
                    </div>
                </div>

                {/* Chart Section */}
                <div className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        Risk Trend Over Time
                    </h2>
                    <RiskChart history={history} />
                </div>

                {/* History Table */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Prediction History
                    </h2>
                    <HistoryTable history={history} onRefresh={fetchHistory} />
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto mt-12 text-center text-slate-500 text-sm">
                <p>Disease Outbreak Prediction System • Built with FastAPI, React & Machine Learning</p>
            </footer>
        </div>
    );
}

export default App;
