import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Thermometer, Droplets, Newspaper, AlertTriangle } from 'lucide-react';

// Map center on India
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// Threat level colors and sizes
const THREAT_CONFIG = {
    HIGH: {
        color: '#ef4444',
        fillColor: '#ef4444',
        radius: 20,
        fillOpacity: 0.6,
        className: 'marker-high'
    },
    MODERATE: {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        radius: 15,
        fillOpacity: 0.5,
        className: 'marker-moderate'
    },
    LOW: {
        color: '#22c55e',
        fillColor: '#22c55e',
        radius: 10,
        fillOpacity: 0.4,
        className: 'marker-low'
    }
};

// Component to handle map interactions
function MapController({ selectedRegion }) {
    const map = useMap();

    useEffect(() => {
        if (selectedRegion) {
            map.flyTo([selectedRegion.latitude, selectedRegion.longitude], 8, {
                duration: 1.5
            });
        }
    }, [selectedRegion, map]);

    return null;
}

function ThreatMap({ regions, onRegionSelect, selectedRegion }) {
    const mapRef = useRef(null);

    const getThreatStatusBadge = (level) => {
        const classes = {
            HIGH: 'status-high',
            MODERATE: 'status-moderate',
            LOW: 'status-low'
        };
        return classes[level] || 'status-low';
    };

    return (
        <MapContainer
            center={INDIA_CENTER}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full rounded-xl"
            ref={mapRef}
            scrollWheelZoom={true}
            style={{ height: '100%', minHeight: '500px' }}
        >
            {/* Dark-themed map tiles */}
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapController selectedRegion={selectedRegion} />

            {/* Region markers */}
            {regions.map((region) => {
                const config = THREAT_CONFIG[region.threat_level] || THREAT_CONFIG.LOW;
                const isSelected = selectedRegion?.id === region.id;

                return (
                    <CircleMarker
                        key={region.id}
                        center={[region.latitude, region.longitude]}
                        radius={isSelected ? config.radius + 5 : config.radius}
                        pathOptions={{
                            color: isSelected ? '#ffffff' : config.color,
                            fillColor: config.fillColor,
                            fillOpacity: isSelected ? 0.8 : config.fillOpacity,
                            weight: isSelected ? 3 : 2
                        }}
                        eventHandlers={{
                            click: () => onRegionSelect(region),
                            mouseover: (e) => {
                                e.target.openPopup();
                            }
                        }}
                    >
                        <Popup className="threat-popup">
                            <div className="min-w-[200px] p-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-lg text-white">{region.name}</h3>
                                    <span className={getThreatStatusBadge(region.threat_level)}>
                                        {region.threat_level}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {/* Weather Risk */}
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-orange-400" />
                                        <span className="text-zinc-400">Weather Risk:</span>
                                        <div className="flex-1 bg-dark-600 rounded-full h-2">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500"
                                                style={{ width: `${(region.weather_risk || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-mono">
                                            {((region.weather_risk || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>

                                    {/* News Risk */}
                                    <div className="flex items-center gap-2">
                                        <Newspaper className="w-4 h-4 text-blue-400" />
                                        <span className="text-zinc-400">News Risk:</span>
                                        <div className="flex-1 bg-dark-600 rounded-full h-2">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500"
                                                style={{ width: `${(region.news_risk || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-mono">
                                            {((region.news_risk || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                {region.threat_level === 'HIGH' && (
                                    <div className="mt-3 p-2 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <span className="text-xs text-red-300">Active outbreak alert</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => onRegionSelect(region)}
                                    className="mt-3 w-full py-2 bg-sentinel-600 hover:bg-sentinel-500 text-white text-sm rounded-lg transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}

export default ThreatMap;
