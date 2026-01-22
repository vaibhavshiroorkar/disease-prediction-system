import { useState, useEffect } from 'react';
import {
    AlertTriangle, MapPin, RefreshCw,
    Thermometer, Newspaper, Shield, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThreatMap from '../components/ThreatMap';
import TrendChart from '../components/TrendChart';
import StatusPanel from '../components/StatusPanel';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Surveillance() {
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Fetch geo status
    const fetchGeoStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/geo/status`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setRegions(data.regions);
            setLastUpdate(data.last_pipeline_run);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch geo status:', err);
            setError('Live connection lost. Displaying cached/demo data.');
            setRegions(getDemoData());
        } finally {
            setLoading(false);
        }
    };

    // Demo data fallback
    const getDemoData = () => [
        { id: 1, name: 'Mumbai', latitude: 19.076, longitude: 72.8777, threat_level: 'HIGH', weather_risk: 0.82, news_risk: 0.65 },
        { id: 2, name: 'Delhi', latitude: 28.6139, longitude: 77.209, threat_level: 'MODERATE', weather_risk: 0.55, news_risk: 0.3 },
        { id: 3, name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, threat_level: 'LOW', weather_risk: 0.25, news_risk: 0.1 },
        { id: 4, name: 'Chennai', latitude: 13.0827, longitude: 80.2707, threat_level: 'HIGH', weather_risk: 0.78, news_risk: 0.7 },
        { id: 5, name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, threat_level: 'MODERATE', weather_risk: 0.48, news_risk: 0.35 },
        { id: 6, name: 'Hyderabad', latitude: 17.385, longitude: 78.4867, threat_level: 'LOW', weather_risk: 0.2, news_risk: 0.15 },
    ];

    useEffect(() => {
        fetchGeoStatus();
        const interval = setInterval(fetchGeoStatus, 300000);
        return () => clearInterval(interval);
    }, []);

    // Count threat levels
    const threatCounts = regions.reduce((acc, r) => {
        acc[r.threat_level] = (acc[r.threat_level] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header Stats */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-sentinel-500" />
                        Live Surveillance
                    </h1>
                    <p className="text-zinc-400 mt-1">Real-time epidemiological monitoring across {regions.length} zones</p>
                </div>

                <div className="flex items-center gap-4 bg-dark-800 p-2 rounded-xl border border-dark-600">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-400">{threatCounts.HIGH || 0} High</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-amber-400">{threatCounts.MODERATE || 0} Mod</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-green-400">{threatCounts.LOW || 0} Low</span>
                    </div>

                    <button
                        onClick={fetchGeoStatus}
                        disabled={loading}
                        className="p-2 ml-2 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-2"
                >
                    <div className="card h-[650px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-sentinel-500" />
                                Regional Heatmap
                            </h2>
                            {lastUpdate && (
                                <span className="text-xs text-zinc-500">
                                    Updated: {new Date(lastUpdate).toLocaleTimeString()}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 rounded-xl overflow-hidden border border-dark-600 relative">
                            {loading && regions.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-dark-800/50 backdrop-blur-sm z-10">
                                    <div className="spinner" />
                                </div>
                            ) : null}
                            <ThreatMap
                                regions={regions}
                                onRegionSelect={setSelectedRegion}
                                selectedRegion={selectedRegion}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Side Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-6"
                >
                    <StatusPanel
                        regions={regions}
                        selectedRegion={selectedRegion}
                        onSelectRegion={setSelectedRegion}
                    />

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-sentinel-500" />
                            Intelligence Feed
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-dark-600 rounded-lg border border-dark-500">
                                <div className="flex items-center gap-2 text-xs text-orange-400 mb-1">
                                    <Thermometer className="w-3 h-3" />
                                    Weather Anomaly
                                </div>
                                <p className="text-sm text-zinc-300">
                                    High humidity levels (85%+) detected in coastal regions favor vector breeding.
                                </p>
                            </div>
                            <div className="p-3 bg-dark-600 rounded-lg border border-dark-500">
                                <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
                                    <Newspaper className="w-3 h-3" />
                                    News Signal
                                </div>
                                <p className="text-sm text-zinc-300">
                                    "Dengue cases rise in metro areas" - Times of India (3 hrs ago)
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Analytics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6"
            >
                {selectedRegion ? (
                    <TrendChart
                        regionId={selectedRegion.id}
                        regionName={selectedRegion.name}
                    />
                ) : (
                    <div className="card py-12 text-center text-zinc-500 border-dashed">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Select a region on the map to view detailed risk analytics and predictive trends.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default Surveillance;
