import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

function RiskChart({ history }) {
    if (history.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p>No data to display yet</p>
                </div>
            </div>
        );
    }

    // Transform data for chart - take last 20 entries and reverse for chronological order
    const chartData = [...history]
        .slice(0, 20)
        .reverse()
        .map((item, index) => ({
            name: new Date(item.timestamp).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short'
            }),
            risk: item.risk_score,
            temperature: item.temperature,
            humidity: item.humidity,
            rainfall: item.rainfall,
            region: item.region_name
        }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const riskLabels = ['Low', 'Moderate', 'High'];
            const riskColors = ['#10B981', '#F59E0B', '#EF4444'];

            return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
                    <p className="text-white font-medium mb-2">{data.region} - {label}</p>
                    <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors[data.risk] }}></span>
                            <span className="text-slate-400">Risk:</span>
                            <span style={{ color: riskColors[data.risk] }} className="font-medium">
                                {riskLabels[data.risk]}
                            </span>
                        </p>
                        <p className="text-slate-300">
                            <span className="text-slate-400">Temp:</span> {data.temperature}°C
                        </p>
                        <p className="text-slate-300">
                            <span className="text-slate-400">Humidity:</span> {data.humidity}%
                        </p>
                        <p className="text-slate-300">
                            <span className="text-slate-400">Rainfall:</span> {data.rainfall}mm
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Risk Trend Chart */}
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="name"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            domain={[0, 2]}
                            ticks={[0, 1, 2]}
                            tickFormatter={(value) => ['Low', 'Med', 'High'][value]}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3B82F6"
                            fontSize={12}
                            tickLine={false}
                            domain={[0, 50]}
                            tickFormatter={(value) => `${value}°`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-slate-300">{value}</span>}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="risk"
                            name="Risk Level"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            fill="url(#riskGradient)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#3B82F6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Info */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-slate-400">0 = Low Risk</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-slate-400">1 = Moderate Risk</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-slate-400">2 = High Risk</span>
                </div>
            </div>
        </div>
    );
}

export default RiskChart;
