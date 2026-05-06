import React, { useState, useEffect } from 'react';
import { 
  MapPin, Users, Car, Heart, Settings, Plus, Trash2, Fuel, 
  ChevronRight, ChevronLeft, Plane, Map as MapIcon, CheckCircle2, Home, Activity, DollarSign, Calendar, Smile,
  Search, Filter, Bus, ShieldCheck, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { NAMIBIA_REGIONS, PACE_OPTIONS, BUDGET_OPTIONS, DETAIL_LEVELS, MONTHS, INTERESTS_CATALOG, VEHICLE_OPTIONS, ACCOMMODATION_STYLES, TRIP_MOODS } from '../constants';
import { TripConfig, Traveler, PickupPoint } from '../types';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LocationInput } from './LocationInput';
import { LocationSuggestion } from '../services/locationIQ';

interface WizardProps {
  onGenerate: (config: TripConfig) => void;
  isLoading: boolean;
}

const RegionDetailsPanel = ({ isSelected }: { isSelected: string[] }) => {
  const [hoveredRegion, setHoveredRegion] = useState<any | null>(null);

  useEffect(() => {
    const handleRegionHover = (e: any) => {
      setHoveredRegion(e.detail);
    };

    window.addEventListener('regionHover', handleRegionHover);
    return () => window.removeEventListener('regionHover', handleRegionHover);
  }, []);

  return (
    <div className="bg-stone-50 rounded-[3rem] p-8 border border-stone-100 flex-1 flex flex-col relative overflow-hidden h-full min-h-[300px]">
      <AnimatePresence mode="wait">
        {hoveredRegion ? (
          <motion.div 
            key={hoveredRegion.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className={`h-48 w-full rounded-2xl overflow-hidden mb-6 relative shrink-0 shadow-lg bg-gradient-to-br ${hoveredRegion.gradient || 'from-stone-800 to-stone-500'}`}>
               <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white font-black text-3xl leading-none drop-shadow-md">{hoveredRegion.name}</h3>
               </div>
            </div>
            <p className="text-stone-600 font-medium text-lg leading-relaxed mb-4">{hoveredRegion.desc}</p>
            
            {isSelected.includes(hoveredRegion.id) ? (
               <div className="mt-auto inline-flex items-center gap-2 text-primary font-black bg-white px-4 py-2 w-max rounded-full shadow-sm">
                  <CheckCircle2 className="w-5 h-5" /> Added to Horizon
               </div>
            ) : (
               <div className="mt-auto inline-flex items-center gap-2 text-stone-400 font-bold">
                  Click to add to your expedition
               </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-stone-400 italic font-bold h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-200 rounded-3xl w-full"
          >
             <MapPin className="w-12 h-12 mb-4 text-stone-300 opacity-50" />
             Hover over the map zones to preview regions.<br/>Click to plot them on your horizon.<br/><br/>
             <span className="text-sm not-italic">Right-click the map anywhere to add custom Pick-up/Stop points!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MapEventsHandler = ({ onRightClick }: { onRightClick: (e: any) => void }) => {
  useMapEvents({
    contextmenu: onRightClick,
  });
  return null;
};

export const Wizard: React.FC<WizardProps> = ({ onGenerate, isLoading }) => {
  const [user] = useAuthState(auth);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activitySort, setActivitySort] = useState<'all' | 'free' | 'high_action'>('all');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, lat: number, lng: number } | null>(null);
  
  const [config, setConfig] = useState<TripConfig>({
    selectedRegions: [],
    travelers: [{ id: 1, name: 'Explorer 1', age: 30, hasLicense: true, budget: 1500 }],
    vehicles: [{ 
      id: `v-${Date.now()}`,
      type: 'private',
      category: 'rugged_4x4',
      rentalMode: 'rental',
      make: VEHICLE_OPTIONS[0].name,
      model: VEHICLE_OPTIONS[0].model,
      drivetrain: VEHICLE_OPTIONS[0].drivetrain,
      transmission: VEHICLE_OPTIONS[0].transmission as any,
      fuelType: VEHICLE_OPTIONS[0].fuel,
      fuelConsumptionL100km: VEHICLE_OPTIONS[0].fuelL100km,
      maxPassengers: VEHICLE_OPTIONS[0].maxPassengers,
      maxLargeBags: VEHICLE_OPTIONS[0].maxLargeBags,
      maxSmallBags: VEHICLE_OPTIONS[0].maxSmallBags,
      currentLargeBags: 0,
      currentSmallBags: 0,
      driverId: 1
    }],
    selectedInterests: [],
    customPickups: [],
    logistics: {
      days: 10,
      month: 'September',
      budget: 'Mid-Range (Standard Lodges, B&Bs, Glamping)',
      budgetPriorities: [],
      pace: 'Moderate (The standard balance of driving and doing)',
      detailLevel: 'standard',
      startingLocation: 'Hosea Kutako International Airport (WDH)',
      accommodationStyles: []
    }
  });

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists()) {
          const profile = docSnap.data();
          if (profile.preferredCurrency) {
            setPreferredCurrency(profile.preferredCurrency);
          }
        }
      }).catch(console.error);
    }
  }, [user]);

  const toggleRegion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(id) 
        ? prev.selectedRegions.filter(r => r !== id) 
        : [...prev.selectedRegions, id]
    }));
  };

  const addRoutingPoint = (lat: number, lng: number, type: 'start' | 'stop' | 'pickup', reason: string = '') => {
    const newPoint: PickupPoint = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      lat,
      lng,
      type,
      reason,
      order: config.customPickups.length + 1
    };
    setConfig(prev => ({
      ...prev,
      customPickups: [...prev.customPickups, newPoint]
    }));
    setContextMenu(null);
  };

  const reorderPoints = (newPoints: PickupPoint[]) => {
    setConfig(prev => ({
      ...prev,
      customPickups: newPoints.map((p, i) => ({ ...p, order: i + 1 }))
    }));
  };

  const removePickup = (id: string) => {
    setConfig(prev => ({
      ...prev,
      customPickups: prev.customPickups.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i + 1 }))
    }));
  };

  const updatePickup = (id: string, updates: Partial<PickupPoint>) => {
    setConfig(prev => ({
      ...prev,
      customPickups: prev.customPickups.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<string[]>([]);
  const [currentRouletteDisplay, setCurrentRouletteDisplay] = useState('');

  const next = () => setStep(s => Math.min(6, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleGenerateClick = () => {
    if (config.selectedRegions.length > config.logistics.days && config.logistics.days > 0) {
      setIsSpinning(true);
      const shuffled = [...config.selectedRegions].sort(() => 0.5 - Math.random());
      const keepers = shuffled.slice(0, config.logistics.days);
      const allNames = NAMIBIA_REGIONS.filter(r => config.selectedRegions.includes(r.id)).map(r => r.name);
      
      setRouletteItems(allNames);

      let spins = 0;
      const spinInterval = setInterval(() => {
        setCurrentRouletteDisplay(allNames[Math.floor(Math.random() * allNames.length)]);
        spins++;
        if (spins > 20) {
          clearInterval(spinInterval);
          setIsSpinning(false);
          const finalConfig = { ...config, selectedRegions: keepers, baseCurrency: preferredCurrency };
          setConfig(finalConfig);
          onGenerate(finalConfig);
        }
      }, 100);
    } else if (config.selectedRegions.length === 0) {
      setIsSpinning(true);
      const shuffled = [...NAMIBIA_REGIONS].sort(() => 0.5 - Math.random());
      const randomCount = Math.max(2, Math.min(config.logistics.days || 3, 4));
      const keepers = shuffled.slice(0, randomCount).map(r => r.id);
      const randomNames = NAMIBIA_REGIONS.map(r => r.name);
      
      setRouletteItems(randomNames);

      let spins = 0;
      const spinInterval = setInterval(() => {
        setCurrentRouletteDisplay(randomNames[Math.floor(Math.random() * randomNames.length)] + ' (Randomly Selecting)');
        spins++;
        if (spins > 30) {
          clearInterval(spinInterval);
          setIsSpinning(false);
          const finalConfig = { ...config, selectedRegions: keepers, baseCurrency: preferredCurrency };
          setConfig(finalConfig);
          onGenerate(finalConfig);
        }
      }, 100);
    } else {
      onGenerate({ ...config, baseCurrency: preferredCurrency });
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const [vehicleFilter, setVehicleFilter] = useState('');
  const [vehicleSort, setVehicleSort] = useState<'all' | 'hybrid' | '4x4' | 'automatic'>('all');

  // Convert warning value based on currency (Rough generic mock conversion just for the warning to look sane, USD baseline is $60)
  const currencyRates: Record<string, number> = { USD: 1, EUR: 0.9, GBP: 0.75, NAD: 18 };
  const getBudgetWarningValue = () => {
    const rate = currencyRates[preferredCurrency] || 1;
    return Math.round(60 * rate);
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
    return symbols[preferredCurrency] || preferredCurrency;
  };

  return (
    <div className="main-canvas min-h-[calc(100vh-160px)] flex flex-col">
      {/* Progress Bar */}
      <div className="flex justify-between mb-8 max-w-3xl mx-auto w-full px-4">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className="flex-1 flex items-center group relative">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 border-2 z-10 ${
                step === s 
                  ? 'bg-amber-600 border-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] scale-110' 
                  : step > s 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-white border-slate-200 text-slate-300'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              {step === s && <motion.div layoutId="active-ring" className="absolute -inset-1.5 border-2 border-amber-600/30 rounded-full" />}
            </div>
            {s < 6 && (
              <div className="flex-1 h-[2px] mx-1">
                <div className={`h-full transition-all duration-1000 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="saas-card flex-1 flex flex-col min-h-0 relative bg-white mb-20 shadow-2xl">
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
              className="flex-1 flex flex-col"
            >
              {step === 1 && (
                <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
                  {/* Left Column: Input/Controls */}
                  <div className="w-full lg:w-[45%] flex flex-col p-8 md:p-12 border-r border-slate-100 bg-slate-50/30">
                    <div className="mb-8">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">THE CANVAS</h2>
                      <p className="text-slate-500 font-medium text-lg leading-snug">
                        Click areas on the map to plot your journey. Right-click to add custom pick-up points.
                      </p>
                    </div>
                    
                    <div className="mb-8 space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-2 block">Search & Add Destination</label>
                        <div className="relative group">
                          <LocationInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSelect={(s: LocationSuggestion) => {
                              addRoutingPoint(parseFloat(s.lat), parseFloat(s.lon), 'stop', s.address.name || s.display_name.split(',')[0]);
                              setSearchQuery(''); 
                            }}
                            placeholder="e.g., Windhoek or Fish River Canyon"
                            className="interactive-hover"
                          />
                        </div>
                      </div>

                      {config.selectedRegions.length > config.logistics.days && config.logistics.days > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border border-red-100 text-red-900 rounded-2xl text-xs font-bold flex gap-3 items-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                          <p>You have selected {config.selectedRegions.length} regions for {config.logistics.days} days. System will auto-optimize.</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 min-h-[300px] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl relative group">
                      <MapContainer 
                        center={[-22.5, 17.5]} 
                        zoom={5} 
                        style={{ height: '100%', width: '100%' }}
                        attributionControl={false}
                      >
                         <TileLayer 
                            attribution='&copy; <a href="https://locationiq.com">LocationIQ</a>'
                            url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.3fd0a0ae7669c99a748712da6ebf7c4e`} 
                         />
                         
                         <MapEventsHandler onRightClick={(e: any) => {
                             setContextMenu({
                               x: e.originalEvent.clientX,
                               y: e.originalEvent.clientY,
                               lat: e.latlng.lat,
                               lng: e.latlng.lng
                             });
                          }} />

                          {/* Route Polyline */}
                          {config.customPickups.length > 1 && (
                            <Polyline 
                              positions={config.customPickups.map(p => [p.lat, p.lng])}
                              color="#2563eb"
                              weight={3}
                              opacity={0.5}
                              dashArray="8, 12"
                            />
                          )}

                         {NAMIBIA_REGIONS.map(r => {
                           const isSelected = config.selectedRegions.includes(r.id);
                           const iconMarkup = renderToStaticMarkup(
                             <div 
                               className={`relative group transition-transform duration-300 hover:scale-125 z-10`}
                               onMouseEnter={() => window.dispatchEvent(new CustomEvent('regionHover', { detail: r }))}
                             >
                                {isSelected && <div className="absolute -inset-2 bg-primary rounded-full animate-pulse opacity-30"></div>}
                                <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-white scale-110' : 'bg-white border-slate-300 rotate-0'}`}>
                                   {isSelected ? <CheckCircle2 className="w-4 h-4 text-white" /> : <r.icon className="w-4 h-4 text-slate-600" />}
                                </div>
                             </div>
                           );

                           return (
                             <Marker 
                               key={r.id} 
                               position={[r.lat!, r.lng!]}
                               icon={L.divIcon({ html: iconMarkup, className: '', iconSize: [32, 32], iconAnchor: [16, 16] })}
                               eventHandlers={{
                                 click: (e) => {
                                   L.DomEvent.stopPropagation(e);
                                   toggleRegion(r.id);
                                 },
                                 mouseover: () => window.dispatchEvent(new CustomEvent('regionHover', { detail: r })),
                                 mouseout: () => window.dispatchEvent(new CustomEvent('regionHover', { detail: null }))
                               }}
                             />
                           );
                         })}

                         {/* Custom Pickups Markers */}
                         {config.customPickups.map((p) => {
                             const pickupMarkup = renderToStaticMarkup(
                               <div className="flex flex-col items-center group relative z-20">
                                  <div className="bg-slate-900 text-white border border-slate-700 text-[10px] font-black px-2 py-1 rounded-lg mb-1 shadow-xl whitespace-nowrap uppercase tracking-wider">
                                     {p.type === 'start' ? 'Start' : p.type === 'stop' ? `Stop ${p.order}` : `Pickup ${p.order}`}
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ${p.type === 'start' ? 'bg-emerald-500' : p.type === 'stop' ? 'bg-blue-600' : 'bg-amber-500'}`}>
                                     {p.type === 'start' ? <Home className="w-3 h-3 text-white" /> : p.type === 'stop' ? <MapPin className="w-3 h-3 text-white" /> : <Car className="w-3 h-3 text-white" />}
                                  </div>
                               </div>
                             );
                             return (
                               <Marker 
                                 key={p.id} 
                                 position={[p.lat, p.lng]} 
                                 icon={L.divIcon({ html: pickupMarkup, className: '', iconSize: [100, 50], iconAnchor: [50, 45] })}
                               />
                             );
                          })}
                       </MapContainer>

                       {/* Map Context Menu */}
                       <AnimatePresence>
                         {contextMenu && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.9, y: 10 }}
                             style={{ left: contextMenu.x, top: contextMenu.y }}
                             className="fixed z-[9999] glass-panel rounded-2xl overflow-hidden w-48 p-2 border border-slate-200/50"
                           >
                             <button 
                               onClick={() => addRoutingPoint(contextMenu.lat, contextMenu.lng, 'stop')}
                               className="w-full text-left p-3 hover:bg-primary hover:text-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-3 group transition-colors"
                             >
                               <MapPin className="w-4 h-4 group-hover:text-white transition-colors" />
                               Add as Stop
                             </button>
                             <button 
                               onClick={() => addRoutingPoint(contextMenu.lat, contextMenu.lng, 'pickup')}
                               className="w-full text-left p-3 hover:bg-primary hover:text-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-3 group transition-colors"
                             >
                               <Car className="w-4 h-4 group-hover:text-white transition-colors" />
                               Add as Pickup
                             </button>
                             <div className="border-t border-slate-100 my-1" />
                             <button 
                               onClick={() => setContextMenu(null)}
                               className="w-full text-left p-3 hover:bg-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl text-center transition-colors"
                             >
                               Cancel
                             </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Right Column: Data/Itinerary */}
                  <div className="hidden lg:flex w-[55%] flex-col p-8 md:p-12 bg-white relative">
                    <div className="mb-8 shrink-0">
                      <h3 className="text-xs font-black text-slate-400 tracking-[0.2em] mb-4 uppercase">SELECTED ROUTING POINTS</h3>
                      <div className="h-1 w-12 bg-primary rounded-full"></div>
                    </div>

                    <div className="flex-1 pr-4 -mr-4 pb-12">
                      <div className="space-y-6">
                        {config.customPickups.length > 0 ? (
                           <Reorder.Group 
                             axis="y" 
                             values={config.customPickups} 
                             onReorder={reorderPoints}
                             className="space-y-4"
                           >
                             {config.customPickups.map(p => (
                               <Reorder.Item 
                                 key={p.id} 
                                 value={p}
                                 className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 group cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
                               >
                                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${p.type === 'start' ? 'bg-emerald-50 text-emerald-600' : p.type === 'stop' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                     {p.type === 'start' ? <Home className="w-6 h-6" /> : p.type === 'stop' ? <MapPin className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.type === 'start' ? 'Origin' : p.type === 'stop' ? 'Waypoint' : 'Pickup'}</span>
                                      <button onClick={() => removePickup(p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="text-slate-900 font-bold truncate pr-4">{p.reason || 'Unnamed Location'}</div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">#{p.order}</div>
                               </Reorder.Item>
                             ))}
                           </Reorder.Group>
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                            <MapIcon className="w-16 h-16 mb-4 text-slate-300" />
                            <p className="text-slate-500 font-bold">No points plotted yet.</p>
                          </div>
                        )}

                        <div className="pt-8 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Expedition Regions</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {config.selectedRegions.length === 0 ? (
                               <p className="col-span-2 text-slate-400 text-sm font-medium italic">Hover over the map zones to preview regions, then click to add them to your horizon.</p>
                            ) : null}
                            {NAMIBIA_REGIONS.filter(r => config.selectedRegions.includes(r.id)).map(r => (
                              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group/item hover:bg-primary/5 transition-colors">
                                <span className="text-sm font-black text-slate-700">{r.name}</span>
                                <button onClick={() => toggleRegion(r.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex-1 flex flex-col">
                  <div className="p-8 md:p-12 shrink-0 border-b border-slate-100">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">THE CREW</h2>
                    <p className="text-slate-500 font-medium text-lg">Who are your fellow explorers?</p>
                  </div>

                  <div className="flex-1 p-8 md:p-12 pb-20">
                    <div className="max-w-4xl mx-auto space-y-6">
                      {config.travelers.length > 0 && config.travelers.every(t => t.age > 0 && t.age < 18) && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-amber-50 border border-amber-100 text-amber-900 rounded-2xl text-sm flex items-start gap-4 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 font-black">!</div>
                          <div>
                            <p className="font-black mb-1 uppercase tracking-tight">Legal Notice</p>
                            <p className="text-amber-800/80">Your entire crew consists of minors. Please verify legal requirements for international travel and driving.</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        {config.travelers.map((t, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            key={t.id} 
                            className="saas-card relative bg-white/50 hover:bg-white transition-all group"
                          >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Name</label>
                                <input 
                                  placeholder="Explorer Name" 
                                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-slate-700"
                                  value={t.name || ''}
                                  onChange={e => setConfig(prev => ({
                                    ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, name: e.target.value } : tr)
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Age</label>
                                <input 
                                  type="number" 
                                  placeholder="30" 
                                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-slate-700"
                                  value={t.age || ''}
                                  onChange={e => setConfig(prev => ({
                                    ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, age: Number(e.target.value) } : tr)
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Budget ({getCurrencySymbol()})</label>
                                <input 
                                  type="number" 
                                  placeholder="1500" 
                                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-slate-700"
                                  value={t.budget || ''}
                                  onChange={e => setConfig(prev => ({
                                    ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, budget: Number(e.target.value) } : tr)
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <div 
                                  className={`flex h-[54px] items-center gap-3 px-4 rounded-2xl cursor-pointer border transition-all ${t.hasLicense ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}
                                  onClick={() => setConfig(prev => ({
                                    ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, hasLicense: !tr.hasLicense } : tr)
                                  }))}
                                >
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${t.hasLicense ? 'bg-primary text-white scale-110' : 'bg-slate-200'}`}>
                                    {t.hasLicense && <CheckCircle2 className="w-4 h-4" />}
                                  </div>
                                  <span className={`text-sm font-black transition-colors ${t.hasLicense ? 'text-primary' : 'text-slate-400'}`}>DRIVER</span>
                                </div>
                              </div>
                            </div>
                            {config.travelers.length > 1 && (
                              <button 
                                onClick={() => setConfig(prev => ({ ...prev, travelers: prev.travelers.filter(tr => tr.id !== t.id) }))}
                                className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 w-8 h-8 rounded-full border border-slate-100 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <button 
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          travelers: [...prev.travelers, { id: Date.now(), name: '', age: 30, hasLicense: false, budget: 1500 }]
                        }))}
                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-3"
                      >
                        <PlusCircle className="w-5 h-5" /> Add Explorer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex-1 flex flex-col">
                  <div className="p-8 md:p-12 shrink-0 border-b border-slate-100 flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">THE WHEELS</h2>
                      <p className="text-slate-500 font-medium text-lg">How are you getting around the dunes?</p>
                    </div>
                    {config.vehicles.length < config.travelers.filter(t => t.hasLicense).length && (
                      <button 
                        onClick={() => {
                          const firstOption = VEHICLE_OPTIONS[0];
                          setConfig(prev => ({
                            ...prev,
                            vehicles: [...prev.vehicles, { 
                              id: `v-${Date.now()}`, 
                              type: 'private', 
                              category: 'rugged_4x4',
                              rentalMode: 'rental',
                              make: VEHICLE_OPTIONS[0].name,
                              model: VEHICLE_OPTIONS[0].model,
                              drivetrain: VEHICLE_OPTIONS[0].drivetrain,
                              transmission: VEHICLE_OPTIONS[0].transmission as any,
                              fuelType: VEHICLE_OPTIONS[0].fuel,
                              fuelConsumptionL100km: VEHICLE_OPTIONS[0].fuelL100km,
                              maxPassengers: VEHICLE_OPTIONS[0].maxPassengers,
                              maxLargeBags: VEHICLE_OPTIONS[0].maxLargeBags,
                              maxSmallBags: VEHICLE_OPTIONS[0].maxSmallBags,
                              currentLargeBags: 0,
                              currentSmallBags: 0,
                              driverId: prev.travelers.find(t => t.hasLicense && !prev.vehicles.some(v => v.driverId === t.id))?.id || prev.travelers[0].id
                            }]
                          }));
                        }}
                        className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all hover:scale-105 shadow-xl shadow-slate-900/10 flex items-center gap-3"
                      >
                        <Plus className="w-4 h-4" /> Add Vehicle
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-8 md:p-12 pb-24">
                    <div className="max-w-5xl mx-auto space-y-12">
                      {config.vehicles.map((vehicle, vIdx) => (
                        <div 
                          key={vehicle.id}
                          className="relative"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Side: Type & Driver */}
                            <div className="lg:col-span-4 space-y-8">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 block">Fleet Architecture</label>
                                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
                                  {['private', 'public', 'guided'].map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => setConfig(prev => ({
                                        ...prev,
                                        vehicles: prev.vehicles.map(v => v.id === vehicle.id ? { 
                                          ...v, 
                                          type: type as any,
                                          category: type === 'public' ? 'public' : 'adventure',
                                          rentalMode: type === 'private' ? 'rental' : undefined
                                        } : v)
                                      }))}
                                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${vehicle.type === type ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 block">Command Pilot</label>
                                <select 
                                  value={vehicle.driverId || ''}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    vehicles: prev.vehicles.map(v => v.id === vehicle.id ? { ...v, driverId: Number(e.target.value) } : v)
                                  }))}
                                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all appearance-none"
                                >
                                  <option value="">Select Lead Explorer...</option>
                                  {config.travelers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} {t.hasLicense ? '(Certified Driver)' : '(Observer)'}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                                  <Fuel className="w-5 h-5 text-primary mb-3" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                  <p className="text-lg font-black text-slate-900">{vehicle.fuelConsumptionL100km || 0}<span className="text-xs ml-1">L/100km</span></p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                                  <Settings className="w-5 h-5 text-primary mb-3" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payload</p>
                                  <p className="text-lg font-black text-slate-900">{vehicle.luggageCapacity || 0}<span className="text-xs ml-1">Bags</span></p>
                                </div>
                              </div>
                              
                              {config.vehicles.length > 1 && (
                                <button 
                                  onClick={() => setConfig(prev => ({ ...prev, vehicles: prev.vehicles.filter(v => v.id !== vehicle.id) }))}
                                  className="w-full py-4 text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100"
                                >
                                  Remove Vehicle
                                </button>
                              )}
                            </div>

                            {/* Right Side: Vehicle Selection */}
                            <div className="lg:col-span-8 space-y-6">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block">Model Selection</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {VEHICLE_OPTIONS.filter(opt => {
                                  if (vehicle.type === 'private') return opt.type === 'SUV' || opt.type === '4x4' || opt.type === 'Pickup';
                                  if (vehicle.type === 'public') return opt.type === 'Bus' || opt.type === 'Shuttle';
                                  return true;
                                }).map(opt => (
                                  <button
                                    key={opt.name}
                                    onClick={() => setConfig(prev => ({
                                      ...prev,
                                      vehicles: prev.vehicles.map(v => v.id === vehicle.id ? { 
                                        ...v, 
                                        make: opt.name,
                                        model: opt.model,
                                        drivetrain: opt.drivetrain,
                                        transmission: opt.transmission as any,
                                        fuelType: opt.fuel,
                                        fuelConsumptionL100km: opt.fuelL100km,
                                        maxPassengers: opt.maxPassengers,
                                        maxLargeBags: opt.maxLargeBags,
                                        maxSmallBags: opt.maxSmallBags,
                                        luggageCapacity: opt.maxLargeBags + Math.floor(opt.maxSmallBags / 2)
                                      } : v)
                                    }))}
                                    className={`p-6 rounded-[2rem] border-2 text-left transition-all flex justify-between items-start group ${vehicle.make === opt.name ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                                  >
                                    <div className="flex gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${vehicle.make === opt.name ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                        <Car className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight">{opt.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{opt.model} • {opt.type}</p>
                                      </div>
                                    </div>
                                    {vehicle.make === opt.name && (
                                      <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                                    )}
                                  </button>
                                ))}
                              </div>

                              {vehicle.type === 'public' && vehicle.ticketCost && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Bus className="w-6 h-6 text-blue-600" />
                                    <div>
                                      <p className="text-[10px] font-black text-blue-400 uppercase">Ticket Cost / Frequency</p>
                                      <p className="text-sm font-black text-blue-900">{getCurrencySymbol()}{vehicle.ticketCost} • {vehicle.frequency}</p>
                                    </div>
                                  </div>
                                  <ShieldCheck className="w-6 h-6 text-blue-200" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex-1 flex flex-col">
                  <div className="p-8 md:p-12 shrink-0 border-b border-slate-100">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">THE VIBE</h2>
                    <p className="text-slate-500 font-medium text-lg">What type of activities and mood fit your vision?</p>
                  </div>

                  <div className="flex-1 p-8 md:p-12 pb-20">
                    <div className="max-w-4xl mx-auto space-y-12">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 block">Select Expedition Mood</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {TRIP_MOODS.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, mood: m.name } }))}
                              className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-4 group ${config.logistics.mood === m.name ? 'border-primary bg-primary/5 shadow-xl' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${config.logistics.mood === m.name ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                <m.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight">{m.name}</h4>
                                <p className="text-xs text-slate-400 font-medium mt-1">{m.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Expedition Interests</label>
                          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
                            <button onClick={() => setActivitySort('all')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activitySort === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>All</button>
                            <button onClick={() => setActivitySort('free')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activitySort === 'free' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><DollarSign className="w-3 h-3"/> Economy</button>
                            <button onClick={() => setActivitySort('high_action')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activitySort === 'high_action' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}><Activity className="w-3 h-3"/> Action</button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {INTERESTS_CATALOG
                            .filter(i => config.selectedRegions.includes(i.region))
                            .filter(i => activitySort === 'all' || (activitySort === 'free' && (i.priceLevel === 'free' || i.priceLevel === 'low')) || (activitySort === 'high_action' && i.athleticNeed === 'high'))
                            .map(interest => (
                              <button
                                key={interest.id}
                                onClick={() => setConfig(prev => ({
                                  ...prev,
                                  selectedInterests: prev.selectedInterests.includes(interest.label)
                                    ? prev.selectedInterests.filter(i => i !== interest.label)
                                    : [...prev.selectedInterests, interest.label]
                                }))}
                                className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col items-start gap-2 ${
                                  config.selectedInterests.includes(interest.label)
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                }`}
                              >
                                <span className="text-xs font-black uppercase tracking-tight">{interest.label}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest opacity-60`}>
                                  {interest.category}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="flex-1 flex flex-col">
                  <div className="p-8 md:p-12 shrink-0 border-b border-slate-100">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">LOGISTICS</h2>
                    <p className="text-slate-500 font-medium text-lg">Final structural details and mission parameters.</p>
                  </div>

                  <div className="flex-1 p-8 md:p-12 pb-20">
                    <div className="max-w-4xl mx-auto space-y-12">
                      {(() => {
                        const totalBudget = config.travelers.reduce((acc, t) => acc + (t.budget || 0), 0);
                        const days = config.logistics.days || 1;
                        const dailyBudget = totalBudget / days;
                        const warningValue = getBudgetWarningValue();
                        
                        if (dailyBudget < warningValue && totalBudget > 0) {
                          return (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-red-50 border border-red-100 rounded-3xl flex gap-5 items-start shadow-sm">
                               <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                                 <Activity className="w-6 h-6 text-red-600" />
                               </div>
                               <div>
                                 <p className="text-sm font-black text-red-900 uppercase tracking-tight mb-1">
                                   Critical Budget Alert: {getCurrencySymbol()}{Math.round(dailyBudget)}/day
                                 </p>
                                 <p className="text-xs text-red-800/70 font-medium leading-relaxed">
                                   Namibian distances are vast and fuel prices are high. This group budget is extremely constrained. Consider increasing capital or strictly planning for survivalist camping.
                                 </p>
                               </div>
                            </motion.div>
                          );
                        }
                        return null;
                      })()}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Expedition Duration (Days)</label>
                          <input 
                            type="number" 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-black text-slate-700 text-lg"
                            value={config.logistics.days}
                            onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, days: Number(e.target.value) } }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center pr-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Departure Sequence</label>
                            {!config.logistics.startDate && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Required</span>}
                          </div>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input 
                              type="date" 
                              className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-black text-slate-700"
                              value={config.logistics.startDate || ''}
                              onChange={e => {
                                const start = e.target.value;
                                const days = config.logistics.days || 1;
                                const end = new Date(start);
                                end.setDate(end.getDate() + days);
                                setConfig(prev => ({ 
                                  ...prev, 
                                  logistics: { 
                                    ...prev.logistics, 
                                    startDate: start,
                                    endDate: end.toISOString().split('T')[0]
                                  } 
                                }));
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Starting Coordinates</label>
                          <LocationInput
                            value={config.logistics.startingLocation || ''}
                            onChange={val => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, startingLocation: val } }))}
                            onSelect={(s: LocationSuggestion) => {
                              setConfig(prev => ({ 
                                ...prev, 
                                logistics: { ...prev.logistics, startingLocation: s.display_name } 
                              }));
                            }}
                            placeholder="Airport, Hotel, or Town..."
                          />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Strategic Priorities</label>
                          <div className="flex flex-wrap gap-2">
                            {['Save on Fuel', 'Splurge on Food', 'Prioritize Activities', 'Luxury Accommodations', 'Budget/Camping'].map(priority => (
                              <button
                                key={priority}
                                onClick={() => setConfig(prev => ({
                                  ...prev,
                                  logistics: {
                                    ...prev.logistics,
                                    budgetPriorities: prev.logistics.budgetPriorities?.includes(priority)
                                      ? prev.logistics.budgetPriorities.filter(p => p !== priority)
                                      : [...(prev.logistics.budgetPriorities || []), priority]
                                  }
                                }))}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                  config.logistics.budgetPriorities?.includes(priority)
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                }`}
                              >
                                {priority}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Expedition Velocity</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {PACE_OPTIONS.map(p => (
                              <div 
                                key={p.id}
                                onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, pace: p.label } }))}
                                className={`saas-card relative h-36 cursor-pointer group transition-all border-4 ${config.logistics.pace === p.label ? 'border-primary ring-4 ring-primary/5' : 'border-white shadow-sm hover:border-slate-100'}`}
                              >
                                <img src={p.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-60" alt={p.label} />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-5">
                                   <p className="text-white text-xs font-black uppercase tracking-widest">{p.label.split('(')[0]}</p>
                                </div>
                                {config.logistics.pace === p.label && (
                                  <div className="absolute top-4 right-4 bg-primary p-1.5 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="flex-1 flex flex-col">
                  <div className="p-8 md:p-12 shrink-0 border-b border-slate-100">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">THE STAY</h2>
                    <p className="text-slate-500 font-medium text-lg">What type of homes or camps fit your vision?</p>
                  </div>

                  <div className="flex-1 p-8 md:p-12 pb-20">
                    <div className="max-w-4xl mx-auto space-y-12">
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 text-center">Movement Philosophy</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <button 
                             onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'nomadic' } }))}
                             className={`p-8 saas-card text-left transition-all border-4 ${(!config.logistics.stayStyle || config.logistics.stayStyle === 'nomadic') ? 'border-primary ring-4 ring-primary/5' : 'border-transparent shadow-sm'}`}
                           >
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${(!config.logistics.stayStyle || config.logistics.stayStyle === 'nomadic') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                                <MapPin className="w-7 h-7" />
                              </div>
                              <h4 className="font-black text-2xl mb-2 text-slate-900 tracking-tight">NOMADIC</h4>
                              <p className="text-sm font-medium text-slate-500 leading-snug">Traverse multiple regions, docking at new lodges as the journey unfolds.</p>
                           </button>
                           <button 
                             onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'basecamp' } }))}
                             className={`p-8 saas-card text-left transition-all border-4 ${config.logistics.stayStyle === 'basecamp' ? 'border-primary ring-4 ring-primary/5' : 'border-transparent shadow-sm'}`}
                           >
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${config.logistics.stayStyle === 'basecamp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                                <Home className="w-7 h-7" />
                              </div>
                              <h4 className="font-black text-2xl mb-2 text-slate-900 tracking-tight">BASECAMP</h4>
                              <p className="text-sm font-medium text-slate-500 leading-snug">Establish a single high-fidelity base and conduct tactical day sorties.</p>
                           </button>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
                        <label className="block text-sm font-black uppercase text-primary mb-2 flex items-center gap-3 relative z-10">
                           <CheckCircle2 className="w-6 h-6" /> LOCK IN SPECIFIC LODGING?
                        </label>
                        <p className="text-primary/70 text-sm mb-6 font-medium max-w-lg relative z-10">
                          If you have already secured an accommodation, enter its name here. The AI will explicitly route your entire itinerary around this anchor point.
                        </p>
                        <div className="relative z-10">
                          <input 
                            type="text" 
                            placeholder="e.g. Sossusvlei Lodge, or Airbnb in Swakopmund" 
                            className="w-full p-5 bg-white border border-primary/20 rounded-2xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-xl"
                            value={config.logistics.specificAccommodation || ''}
                            onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, specificAccommodation: e.target.value } }))}
                          />
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {!config.logistics.specificAccommodation ? (
                          <motion.div 
                            key="tiers"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 block">Accommodation Tiers</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {BUDGET_OPTIONS.map(b => (
                                <div 
                                  key={b.id}
                                  onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, budget: b.label } }))}
                                  className={`saas-card relative h-40 cursor-pointer group transition-all border-4 ${config.logistics.budget === b.label ? 'border-primary shadow-xl' : 'border-white hover:border-slate-100'}`}
                                >
                                  <img src={b.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-60" alt={b.label} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-6">
                                     <p className="text-white text-xs font-black uppercase tracking-widest">{b.label}</p>
                                  </div>
                                  {config.logistics.budget === b.label && (
                                    <div className="absolute top-4 right-4 bg-primary p-1.5 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="locked"
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-12 text-center saas-card bg-emerald-50/50 border-emerald-100 flex flex-col items-center"
                          >
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                              <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-black text-emerald-900 mb-2 uppercase italic tracking-tighter">LODGING ANCHORED</h4>
                            <p className="text-emerald-700 font-medium max-w-md">
                              Your provided accommodation is now the tactical hub. The AI engine will bypass general tiers and explicitly curate your expedition around this specific base.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button 
            disabled={step === 1}
            onClick={back}
            className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0 px-4 py-2 rounded-xl hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Scene
          </button>
          
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">STEP {step} OF 6</span>
            {step < 6 ? (
              <button 
                onClick={next}
                disabled={step === 5 && !config.logistics.startDate}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                disabled={isLoading || isSpinning}
                onClick={handleGenerateClick}
                className="px-10 py-4 bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Architecting...' : isSpinning ? 'Running Roulette...' : 'Commence Journey'} <Plane className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSpinning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-16 text-center max-w-2xl mx-auto px-4">
               <h2 className="text-4xl font-black text-white mb-4">Location Roulette</h2>
               <p className="text-stone-300 font-medium text-lg leading-relaxed">You selected more regions than your timeframe allows. The engine is randomly optimizing the best {config.logistics.days} destinations for your route!</p>
            </div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="mt-12 bg-white rounded-[3rem] p-12 shadow-2xl shadow-primary/20 border-4 border-primary"
            >
               <p className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter text-center">{currentRouletteDisplay || '...'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
