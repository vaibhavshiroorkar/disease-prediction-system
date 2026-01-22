import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { TrendingUp, Clock, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Demo data generator for development
const generateDemoData = (hours = 72) => {
    const data = [];
    const now = new Date();

    for (let i = hours; i >= 0; i--) {
        const time = new Date(now - i * 3600 * 1000);
        data.push({
            timestamp: time.toISOString(),
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            weather_risk: Math.min(0.3 + Math.random() * 0.5 + Math.sin(i / 12) * 0.2, 1),
            news_risk: Math.min(0.1 + Math.random() * 0.4, 1),
        });
    }

    return data;
};

function TrendChart({ regionId, regionName }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hours, setHours] = useState(72);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/trends/${regionId}?hours=${hours}`);

            if (!response.ok) {
                throw new Error('Failed to fetch trends');
            }

            const result = await response.json();

            // Transform data for recharts
            const chartData = result.data_points.map(point => ({
                timestamp: point.timestamp,
                time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(point.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                weather_risk: (point.weather_risk * 100).toFixed(1),
                news_risk: (point.news_risk * 100).toFixed(1),
                threat_level: point.threat_level
            }));

            setData(chartData.length > 0 ? chartData : generateDemoData(hours));
        } catch (err) {
            console.error('Trend fetch error:', err);
            // Use demo data for development
            setData(generateDemoData(hours).map(d => ({
                ...d,
                weather_risk: (d.weather_risk * 100).toFixed(1),
                news_risk: (d.news_risk * 100).toFixed(1)
            })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (regionId) {
            fetchTrends();
        }
    }, [regionId, hours]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="tooltip-content">
                    <p className="text-xs text-zinc-400 mb-2">{payload[0]?.payload?.date} {label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-zinc-300">{entry.name}:</span>
                            <span className="font-mono text-white">{entry.value}%</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-sentinel-500" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Risk Trends</h3>
                        <p className="text-sm text-zinc-400">{regionName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-2 bg-dark-600 rounded-lg p-1">
                        {[24, 48, 72].map(h => (
                            <button
                                key={h}
                                onClick={() => setHours(h)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${hours === h
                                        ? 'bg-sentinel-600 text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {h}h
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchTrends}
                        disabled={loading}
                        className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeather" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />

                            <XAxis
                                dataKey="time"
                                stroke="#71717a"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickLine={{ stroke: '#2e2e3a' }}
                            />

                            <YAxis
                                stroke="#71717a"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickLine={{ stroke: '#2e2e3a' }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />

                            <Area
                                type="monotone"
                                dataKey="weather_risk"
                                name="Weather Risk"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorWeather)"
                            />

                            <Area
                                type="monotone"
                                dataKey="news_risk"
                                name="News Risk"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorNews)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Stats */}
            {data.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-500 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-zinc-500">Latest Weather</p>
                        <p className="text-lg font-semibold text-amber-400">
                            {data[data.length - 1]?.weather_risk}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-zinc-500">Latest News</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {data[data.length - 1]?.news_risk}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-zinc-500">Data Points</p>
                        <p className="text-lg font-semibold text-zinc-300">{data.length}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TrendChart;
