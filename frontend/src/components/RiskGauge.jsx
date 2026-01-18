function RiskGauge({ prediction }) {
    if (!prediction) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Enter data to see risk assessment</p>
            </div>
        );
    }

    const riskLevel = prediction.predicted_risk_level;
    const probabilities = prediction.probabilities;

    const riskConfig = {
        LOW: {
            color: '#10B981',
            bgColor: 'from-green-500/20 to-emerald-500/20',
            borderColor: 'border-green-500/50',
            icon: '✓',
            label: 'Low Risk'
        },
        MODERATE: {
            color: '#F59E0B',
            bgColor: 'from-yellow-500/20 to-orange-500/20',
            borderColor: 'border-yellow-500/50',
            icon: '⚠',
            label: 'Moderate Risk'
        },
        HIGH: {
            color: '#EF4444',
            bgColor: 'from-red-500/20 to-rose-500/20',
            borderColor: 'border-red-500/50',
            icon: '⚡',
            label: 'High Risk'
        }
    };

    const config = riskConfig[riskLevel] || riskConfig.LOW;

    return (
        <div className="space-y-6">
            {/* Main Risk Card */}
            <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.bgColor} border ${config.borderColor} p-6 ${riskLevel === 'HIGH' ? 'animate-risk-pulse' : ''}`}
                style={{ '--risk-color': config.color }}
            >
                {/* Background Glow */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `radial-gradient(circle at center, ${config.color} 0%, transparent 70%)`
                    }}
                />

                <div className="relative flex items-center gap-4">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                        style={{
                            backgroundColor: `${config.color}20`,
                            border: `3px solid ${config.color}`
                        }}
                    >
                        {config.icon}
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Predicted Risk</p>
                        <h3
                            className="text-3xl font-bold"
                            style={{ color: config.color }}
                        >
                            {config.label}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">{prediction.region_name}</p>
                    </div>
                </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-3">
                <p className="text-sm text-slate-400 font-medium">Probability Distribution</p>

                {/* Low */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-400">Low</span>
                        <span className="text-green-400">{probabilities.low}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${probabilities.low}%` }}
                        />
                    </div>
                </div>

                {/* Moderate */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-yellow-400">Moderate</span>
                        <span className="text-yellow-400">{probabilities.moderate}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${probabilities.moderate}%` }}
                        />
                    </div>
                </div>

                {/* High */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-400">High</span>
                        <span className="text-red-400">{probabilities.high}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500"
                            style={{ width: `${probabilities.high}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Message */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">📋 Recommendation: </span>
                    {prediction.message}
                </p>
            </div>
        </div>
    );
}

export default RiskGauge;
