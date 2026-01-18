import { useState } from 'react';

const REGIONS = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

function PredictionForm({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        region_name: 'Mumbai',
        temperature: 30,
        humidity: 70,
        rainfall: 100,
        population_density: 3000
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'region_name' ? value : parseFloat(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Region Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Region / City
                </label>
                <select
                    name="region_name"
                    value={formData.region_name}
                    onChange={handleChange}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                    {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
            </div>

            {/* Temperature */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Average Temperature (°C)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        min="0"
                        max="50"
                        step="0.5"
                        className="w-full pr-12"
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">°C</span>
                </div>
                <div className="mt-1">
                    <input
                        type="range"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        min="0"
                        max="50"
                        step="0.5"
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            {/* Humidity */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Humidity (%)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="1"
                        className="w-full pr-12"
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
                <div className="mt-1">
                    <input
                        type="range"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>

            {/* Rainfall */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rainfall (mm)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        min="0"
                        max="500"
                        step="5"
                        className="w-full pr-12"
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">mm</span>
                </div>
                <div className="mt-1">
                    <input
                        type="range"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        min="0"
                        max="500"
                        step="5"
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                </div>
            </div>

            {/* Population Density */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Population Density (per km²)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="population_density"
                        value={formData.population_density}
                        onChange={handleChange}
                        min="0"
                        max="50000"
                        step="100"
                        className="w-full pr-16"
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">/km²</span>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Predict Outbreak Risk
                    </>
                )}
            </button>
        </form>
    );
}

export default PredictionForm;
