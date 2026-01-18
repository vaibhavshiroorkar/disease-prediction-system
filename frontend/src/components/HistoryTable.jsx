function HistoryTable({ history, onRefresh }) {
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRiskBadge = (risk) => {
        const classes = {
            LOW: 'risk-badge risk-low',
            MODERATE: 'risk-badge risk-moderate',
            HIGH: 'risk-badge risk-high'
        };
        return classes[risk] || classes.LOW;
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No predictions yet. Make your first prediction above!</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with Refresh */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Region</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Temp</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Humidity</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Rainfall</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Risk</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <span className="font-medium text-white">{item.region_name}</span>
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                    {item.temperature}°C
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                    {item.humidity}%
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                    {item.rainfall}mm
                                </td>
                                <td className="py-3 px-4">
                                    <span className={getRiskBadge(item.predicted_risk_level)}>
                                        {item.predicted_risk_level}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-sm">
                                    {formatDate(item.timestamp)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
                <span>Showing {history.length} predictions</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Low: {history.filter(h => h.predicted_risk_level === 'LOW').length}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Moderate: {history.filter(h => h.predicted_risk_level === 'MODERATE').length}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        High: {history.filter(h => h.predicted_risk_level === 'HIGH').length}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default HistoryTable;
