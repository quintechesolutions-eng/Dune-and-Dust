import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AntPath } from 'leaflet-ant-path';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ItineraryData } from '../types';
import { getOSRMRoute, RouteGeometry } from '../services/routing';
import { Fuel, Utensils, Compass, Home, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for Leaflet default icon issues in React/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ExpeditionMapProps {
  data: ItineraryData;
}

const AntPathOverlay = ({ positions, options }: any) => {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length < 2) return;
    // @ts-ignore
    const antPath = new AntPath(positions, options);
    antPath.addTo(map);
    return () => {
      antPath.remove();
    };
  }, [map, positions, options]);
  return null;
};

const createCustomIcon = (IconComponent: any, color: string) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ color, backgroundColor: 'white', borderRadius: '50%', padding: '6px', border: `2px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
      <IconComponent size={20} />
    </div>
  );
  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const DAY_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'
];

export const ExpeditionMap: React.FC<ExpeditionMapProps> = ({ data }) => {
  const [routes, setRoutes] = useState<Record<number, [number, number][]>>({});
  const [visibleLayers, setVisibleLayers] = useState({
    meals: true,
    fuel: true,
    activities: true,
    lodging: true
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      const newRoutes: Record<number, [number, number][]> = {};
      
      for (let i = 0; i < data.dailyPlan.length - 1; i++) {
        const start = data.dailyPlan[i];
        const end = data.dailyPlan[i+1];
        
        if (start.latitude && start.longitude && end.latitude && end.longitude) {
          const geometry = await getOSRMRoute([
            { lat: start.latitude, lng: start.longitude },
            { lat: end.latitude, lng: end.longitude }
          ]);
          
          if (geometry) {
            newRoutes[start.day] = geometry.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
          } else {
            // Fallback to straight line
            newRoutes[start.day] = [
              [start.latitude, start.longitude],
              [end.latitude, end.longitude]
            ];
          }
        }
      }
      setRoutes(newRoutes);
    };

    fetchRoutes();
  }, [data]);

  const allPoints = data.dailyPlan.filter(d => d.latitude && d.longitude);
  const center: [number, number] = allPoints.length > 0 
    ? [allPoints[0].latitude!, allPoints[0].longitude!]
    : [-22.5609, 17.0658];

  return (
    <div className="relative w-full h-full group">
      {/* Layer Toggles */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-stone-200">
        <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1 px-1">Layers</h4>
        <LayerToggle 
          active={visibleLayers.lodging} 
          onClick={() => setVisibleLayers(v => ({ ...v, lodging: !v.lodging }))}
          icon={Home} label="Lodging" color="text-indigo-600"
        />
        <LayerToggle 
          active={visibleLayers.meals} 
          onClick={() => setVisibleLayers(v => ({ ...v, meals: !v.meals }))}
          icon={Utensils} label="Dining" color="text-orange-600"
        />
        <LayerToggle 
          active={visibleLayers.fuel} 
          onClick={() => setVisibleLayers(v => ({ ...v, fuel: !v.fuel }))}
          icon={Fuel} label="Fuel" color="text-red-600"
        />
        <LayerToggle 
          active={visibleLayers.activities} 
          onClick={() => setVisibleLayers(v => ({ ...v, activities: !v.activities }))}
          icon={Compass} label="Interests" color="text-emerald-600"
        />
      </div>

      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading>
          {data.dailyPlan.map((day) => (
            <React.Fragment key={`day-${day.day}`}>
              {/* Main Day Marker */}
              {day.latitude && day.longitude && visibleLayers.lodging && (
                <Marker 
                  position={[day.latitude, day.longitude]} 
                  icon={createCustomIcon(MapPin, DAY_COLORS[(day.day - 1) % DAY_COLORS.length])}
                >
                  <Popup className="premium-popup">
                    <div className="p-2">
                      <h3 className="font-black text-stone-900">Day {day.day}: {day.location}</h3>
                      <p className="text-xs text-stone-500 mt-1">{day.accommodation.name}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Waypoints */}
              {day.waypoints?.map((wp, i) => {
                if (wp.type === 'fuel' && !visibleLayers.fuel) return null;
                if (wp.type === 'meal' && !visibleLayers.meals) return null;
                if (wp.type === 'activity' && !visibleLayers.activities) return null;

                const icon = wp.type === 'fuel' ? Fuel : wp.type === 'meal' ? Utensils : Compass;
                const color = wp.type === 'fuel' ? '#ef4444' : wp.type === 'meal' ? '#f97316' : '#10b981';

                return (
                  <Marker 
                    key={`wp-${day.day}-${i}`} 
                    position={[wp.latitude, wp.longitude]} 
                    icon={createCustomIcon(icon, color)}
                  >
                    <Popup>
                      <div className="p-1">
                        <span className="text-[10px] font-black uppercase text-stone-400 block">{wp.type}</span>
                        <h4 className="font-bold text-stone-900">{wp.name}</h4>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          ))}
        </MarkerClusterGroup>

        {/* Routes */}
        {Object.entries(routes).map(([dayStr, path]) => {
          const dayNum = parseInt(dayStr);
          return (
            <AntPathOverlay
              key={`route-${dayNum}`}
              positions={path}
              options={{
                color: DAY_COLORS[(dayNum - 1) % DAY_COLORS.length],
                weight: 5,
                opacity: 0.8,
                dashArray: [10, 20],
                pulseColor: '#ffffff',
                delay: 3000
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

const LayerToggle = ({ active, onClick, icon: Icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${active ? 'bg-stone-100 shadow-inner' : 'opacity-40 grayscale'}`}
  >
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-xs font-black text-stone-700">{label}</span>
  </button>
);
