import { AlertTriangle, MapPin, Thermometer, Newspaper } from 'lucide-react';

function StatusPanel({ regions, selectedRegion, onSelectRegion }) {
    // Sort regions by threat level (HIGH first)
    const sortedRegions = [...regions].sort((a, b) => {
        const order = { HIGH: 0, MODERATE: 1, LOW: 2 };
        return order[a.threat_level] - order[b.threat_level];
    });

    const getThreatStyles = (level) => {
        switch (level) {
            case 'HIGH':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30 hover:border-red-500',
                    dot: 'bg-red-500 animate-pulse',
                    text: 'text-red-400'
                };
            case 'MODERATE':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30 hover:border-amber-500',
                    dot: 'bg-amber-500',
                    text: 'text-amber-400'
                };
            default:
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30 hover:border-green-500',
                    dot: 'bg-green-500',
                    text: 'text-green-400'
                };
        }
    };

    return (
        <div className="card max-h-[400px] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-sentinel-500" />
                Region Status
            </h3>

            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {sortedRegions.map(region => {
                    const styles = getThreatStyles(region.threat_level);
                    const isSelected = selectedRegion?.id === region.id;

                    return (
                        <button
                            key={region.id}
                            onClick={() => onSelectRegion(region)}
                            className={`w-full p-3 rounded-xl border transition-all text-left ${styles.bg} ${styles.border} ${isSelected ? 'ring-2 ring-sentinel-500' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                                    <span className="font-medium text-white">{region.name}</span>
                                </div>
                                <span className={`text-xs font-bold ${styles.text}`}>
                                    {region.threat_level}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1 text-zinc-400">
                                    <Thermometer className="w-3 h-3" />
                                    <span>Weather: </span>
                                    <span className="text-white font-mono">
                                        {((region.weather_risk || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-zinc-400">
                                    <Newspaper className="w-3 h-3" />
                                    <span>News: </span>
                                    <span className="text-white font-mono">
                                        {((region.news_risk || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {regions.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No region data available</p>
                </div>
            )}
        </div>
    );
}

export default StatusPanel;
