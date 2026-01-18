import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { CloudRain, Thermometer, Droplets, MapPin, Users, Activity, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const PredictionForm = ({ onSubmit, loading }) => {
    const { fetchWeather, loading: weatherLoading } = useWeather();

    // Default values
    const [formData, setFormData] = useState({
        region_name: 'Mumbai',
        temperature: 30,
        humidity: 70,
        rainfall: 100,
        population_density: 3000,
        disease: 'Dengue'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'region_name' || name === 'disease' ? value : parseFloat(value) || 0
        }));
    };

    const handleWeatherAutoFill = () => {
        fetchWeather((data) => {
            setFormData(prev => ({ ...prev, ...data }));
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Header / Disease Type */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> Disease Type
                    </label>
                    <select
                        name="disease"
                        value={formData.disease}
                        onChange={handleChange}
                        className="glass-input w-full bg-slate-900 appearance-none cursor-pointer hover:border-cyan-500/50"
                    >
                        <option value="Dengue">🦟 Dengue</option>
                        <option value="Malaria">💧 Malaria</option>
                        <option value="Chikungunya">🦠 Chikungunya</option>
                        <option value="Zika">🩸 Zika</option>
                    </select>
                </div>
            </div>

            {/* Region & Auto-Location */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" /> Region / City
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="region_name"
                        value={formData.region_name}
                        onChange={handleChange}
                        className="glass-input flex-1"
                        placeholder="e.g. Mumbai"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleWeatherAutoFill}
                        disabled={weatherLoading}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg px-4 flex items-center gap-2 transition-all disabled:opacity-50"
                        title="Auto-fill from current location"
                    >
                        {weatherLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Temperature */}
                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-400" /> Temp (°C)
                        </label>
                        <span className="text-cyan-400 font-mono">{formData.temperature}°C</span>
                    </div>
                    <input
                        type="range"
                        name="temperature"
                        min="0"
                        max="50"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Humidity */}
                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-400" /> Humidity (%)
                        </label>
                        <span className="text-blue-400 font-mono">{formData.humidity}%</span>
                    </div>
                    <input
                        type="range"
                        name="humidity"
                        min="0"
                        max="100"
                        value={formData.humidity}
                        onChange={handleChange}
                        className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Rainfall */}
                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <CloudRain className="w-4 h-4 text-indigo-400" /> Rain (mm)
                        </label>
                        <span className="text-indigo-400 font-mono">{formData.rainfall}mm</span>
                    </div>
                    <input
                        type="range"
                        name="rainfall"
                        min="0"
                        max="500"
                        value={formData.rainfall}
                        onChange={handleChange}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Density */}
                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" /> Density (p/km²)
                        </label>
                        <span className="text-purple-400 font-mono">{formData.population_density}</span>
                    </div>
                    <input
                        type="range"
                        name="population_density"
                        min="0"
                        max="20000"
                        step="100"
                        value={formData.population_density}
                        onChange={handleChange}
                        className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Risk...
                    </>
                ) : (
                    <>
                        🚀 Predict Outbreak Risk
                    </>
                )}
            </button>
        </form>
    );
};

export default PredictionForm;
