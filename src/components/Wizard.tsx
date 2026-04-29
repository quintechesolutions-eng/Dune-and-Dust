import React, { useState, useEffect } from 'react';
import { 
  MapPin, Users, Car, Heart, Settings, Plus, Trash2, Fuel, 
  ChevronRight, ChevronLeft, Plane, Map as MapIcon, CheckCircle2, Home, Activity, DollarSign, Calendar, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  const [activitySort, setActivitySort] = useState<'all' | 'free' | 'high_action'>('all');
  
  const [config, setConfig] = useState<TripConfig>({
    selectedRegions: [],
    travelers: [{ id: 1, name: 'Explorer 1', age: 30, hasLicense: true, budget: 1500 }],
    vehicle: { rentalMode: 'rental', make: VEHICLE_OPTIONS[0].name, model: '', drivetrain: VEHICLE_OPTIONS[0].drivetain, fuelType: VEHICLE_OPTIONS[0].fuel, numberOfVehicles: 1, fuelConsumptionL100km: VEHICLE_OPTIONS[0].fuelL100km },
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

  const addCustomPickup = (e: any) => {
    e.originalEvent.preventDefault();
    const { lng, lat } = e.lngLat;
    const newPickup: PickupPoint = {
      id: Date.now().toString(),
      lat,
      lng,
      type: config.customPickups.length === 0 ? 'start' : 'pickup',
      reason: '',
      order: config.customPickups.length + 1
    };
    setConfig(prev => ({
      ...prev,
      customPickups: [...prev.customPickups, newPickup]
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className="flex-1 flex items-center group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all flex-shrink-0 border-2 ${step >= s ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-white border-stone-200 text-stone-400'}`}>
              {s}
            </div>
            {s < 6 && <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${step > s ? 'bg-amber-600' : 'bg-stone-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden relative">
        <div className="p-8 md:p-12 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
            >
              {step === 1 && (
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2 flex flex-col">
                    <h2 className="text-3xl font-black mb-2">The Canvas</h2>
                    <p className="text-stone-500 mb-6">Click areas on the map to plot your journey. Right-click to add custom pick-up points.</p>
                    
                    {config.selectedRegions.length > config.logistics.days && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                        <strong>Warning:</strong> You have selected {config.selectedRegions.length} regions but only have {config.logistics.days} days. The system will auto-optimize.
                      </div>
                    )}
                    
                    <div className="relative w-full aspect-[4/5] bg-[#E8E6E1] rounded-[3rem] shadow-inner border border-stone-200 overflow-hidden flex-1 group">
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
                            const { lat, lng } = e.latlng;
                            addCustomPickup({ lngLat: { lng, lat }, originalEvent: e.originalEvent });
                         }} />

                         {NAMIBIA_REGIONS.map(r => {
                           const isSelected = config.selectedRegions.includes(r.id);
                           const iconMarkup = renderToStaticMarkup(
                             <div 
                               className={`relative group transition-transform duration-300 hover:scale-125 z-10`}
                               onMouseEnter={() => window.dispatchEvent(new CustomEvent('regionHover', { detail: r }))}
                             >
                                {isSelected && <div className="absolute -inset-2 bg-primary rounded-full animate-pulse opacity-30"></div>}
                                <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-white scale-110' : 'bg-white border-stone-300 rotate-0'}`}>
                                   {isSelected ? <CheckCircle2 className="w-4 h-4 text-white" /> : <r.icon className="w-4 h-4 text-stone-600" />}
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
                                 <div className="bg-stone-900 text-white border border-stone-700 text-[10px] font-bold px-2 py-1 rounded-lg mb-1 shadow-xl whitespace-nowrap">
                                    {p.type === 'start' ? 'Start' : `Stop ${p.order}`}
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ${p.type === 'start' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                    <MapPin className="w-3 h-3 text-white" />
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
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 flex flex-col gap-6">
                     <RegionDetailsPanel isSelected={config.selectedRegions} />
                     
                     <div className="bg-stone-50 border border-stone-100 rounded-3xl p-6">
                       <h4 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Selected Routing Points</h4>
                       
                       {/* Custom Stops Panel */}
                       {config.customPickups.length > 0 && (
                         <div className="space-y-3 mb-6">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Custom Stops</p>
                           {config.customPickups.map(p => (
                             <div key={p.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-sm flex flex-col gap-2 relative">
                               <div className="flex gap-2 items-center">
                                 <select 
                                   value={p.type} 
                                   onChange={e => updatePickup(p.id, { type: e.target.value as any })}
                                   className="bg-stone-100 text-stone-700 text-xs font-bold px-2 py-1 rounded"
                                 >
                                   <option value="start">Start Location</option>
                                   <option value="pickup">Mid-Trip Pick-up/Stop</option>
                                 </select>
                                 <LocationInput
                                   value={p.reason}
                                   onChange={val => updatePickup(p.id, { reason: val })}
                                   onSelect={(s: LocationSuggestion) => {
                                     updatePickup(p.id, { 
                                       reason: s.address.name || s.display_name.split(',')[0],
                                       lat: parseFloat(s.lat),
                                       lng: parseFloat(s.lon)
                                     });
                                   }}
                                   placeholder="e.g. Home, Airport, Hotel..."
                                   className="flex-1"
                                 />
                               </div>
                               <button onClick={() => removePickup(p.id)} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 z-10"><Trash2 className="w-4 h-4"/></button>
                             </div>
                           ))}
                         </div>
                       )}

                       <div>
                         <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Expedition Regions</p>
                         <div className="flex flex-wrap gap-2">
                           {config.selectedRegions.length === 0 ? <span className="text-stone-400 text-sm font-bold">None selected.</span> : null}
                           {NAMIBIA_REGIONS.filter(r => config.selectedRegions.includes(r.id)).map(r => (
                             <span key={r.id} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg flex items-center gap-2">
                               {r.name}
                               <button onClick={() => toggleRegion(r.id)} className="hover:bg-primary/20 p-1 rounded-full"><Trash2 className="w-3 h-3" /></button>
                             </span>
                           ))}
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-3xl font-black">The Crew</h2>
                    <div className="flex items-center gap-2">
                       <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Base Currency</label>
                       <select 
                         className="p-2 border rounded-xl font-bold bg-white text-stone-700 outline-none focus:ring-2 focus:ring-primary"
                         value={preferredCurrency}
                         onChange={e => setPreferredCurrency(e.target.value)}
                       >
                         <option value="USD">USD ($)</option>
                         <option value="EUR">EUR (€)</option>
                         <option value="GBP">GBP (£)</option>
                         <option value="NAD">NAD (N$)</option>
                       </select>
                    </div>
                  </div>
                  <p className="text-stone-500 mb-8">Who are your fellow explorers?</p>
                  
                  {config.travelers.length > 0 && config.travelers.every(t => t.age > 0 && t.age < 18) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm flex items-start gap-3">
                      <div className="mt-1 font-black">!</div>
                      <p><strong>Heads Up:</strong> Your entire crew consists of minors under 18. Please verify legal travel requirements for driving and borders.</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {config.travelers.map((t, idx) => (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} key={t.id} className="p-6 bg-stone-50 rounded-2xl relative border border-stone-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Explorer Name</label>
                            <input 
                              placeholder="Name" 
                              className="w-full p-3 border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                              value={t.name || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, name: e.target.value } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Age</label>
                            <input 
                              type="number" 
                              placeholder="Age" 
                              className="w-full p-3 border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                              value={t.age || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, age: Number(e.target.value) } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Budget ({getCurrencySymbol()})</label>
                            <input 
                              type="number" 
                              placeholder={`Budget in ${preferredCurrency}`} 
                              className="w-full p-3 border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                              value={t.budget || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, budget: Number(e.target.value) } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Can Drive?</label>
                            <div className="flex h-[50px] items-center gap-2 px-4 bg-white border rounded-xl cursor-pointer hover:border-primary transition" onClick={() => setConfig(prev => ({
                                ...prev, travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, hasLicense: !tr.hasLicense } : tr)
                              }))}>
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${t.hasLicense ? 'bg-primary text-white' : 'bg-stone-200'}`}>
                                {t.hasLicense && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className="text-sm font-bold text-stone-600">Driver</span>
                            </div>
                          </div>
                        </div>
                        {config.travelers.length > 1 && (
                          <button 
                            onClick={() => setConfig(prev => ({ ...prev, travelers: prev.travelers.filter(tr => tr.id !== t.id) }))}
                            className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                    <button 
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        travelers: [...prev.travelers, { id: Date.now(), name: '', age: 30, hasLicense: false, budget: 1500 }]
                      }))}
                      className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-stone-400 font-bold hover:bg-stone-50 hover:text-stone-600 hover:border-stone-400 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Add Explorer
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Wheels</h2>
                  <p className="text-stone-500 mb-8">What are we driving across the dunes?</p>
                  
                  <div className="mb-10 bg-stone-50 p-6 rounded-[2rem] border border-stone-200">
                    <label className="block text-sm font-black uppercase text-stone-600 mb-4">Acquisition Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button onClick={() => setConfig({ ...config, vehicle: { ...config.vehicle, rentalMode: 'rental' } })} className={`p-6 rounded-2xl border-4 text-left transition-all ${config.vehicle.rentalMode === 'rental' ? 'border-primary bg-blue-50 ring-4 ring-blue-100' : 'border-white hover:border-stone-300 shadow-sm bg-white'}`}>
                         <Car className={`w-8 h-8 mb-3 ${config.vehicle.rentalMode === 'rental' ? 'text-primary' : 'text-stone-400'}`} />
                         <h4 className="font-black text-xl mb-1 text-stone-900">Book a Rental</h4>
                         <p className="text-sm font-medium text-stone-500">Pick up a fully equipped vehicle upon landing.</p>
                       </button>
                       <button onClick={() => setConfig({ ...config, vehicle: { ...config.vehicle, rentalMode: 'own' } })} className={`p-6 rounded-2xl border-4 text-left transition-all ${config.vehicle.rentalMode === 'own' ? 'border-primary bg-blue-50 ring-4 ring-blue-100' : 'border-white hover:border-stone-300 shadow-sm bg-white'}`}>
                         <Home className={`w-8 h-8 mb-3 ${config.vehicle.rentalMode === 'own' ? 'text-primary' : 'text-stone-400'}`} />
                         <h4 className="font-black text-xl mb-1 text-stone-900">Self-Owned</h4>
                         <p className="text-sm font-medium text-stone-500">Driving my own or a locally supplied car.</p>
                       </button>
                    </div>
                  </div>

                  {/* Multi-car question — only if 2+ licensed drivers */}
                  {config.travelers.filter(t => t.hasLicense).length >= 2 && (
                    <div className="mb-10 bg-amber-50 p-6 rounded-[2rem] border border-amber-200">
                      <label className="block text-sm font-black uppercase text-amber-800 mb-3">How many vehicles in your convoy?</label>
                      <p className="text-amber-700 text-sm font-medium mb-4">You have {config.travelers.filter(t => t.hasLicense).length} licensed drivers. Will you be splitting into separate vehicles?</p>
                      <div className="flex gap-3">
                        {[1, 2, 3].map(n => (
                          <button key={n} onClick={() => setConfig(prev => ({ ...prev, vehicle: { ...prev.vehicle, numberOfVehicles: n } }))} className={`px-8 py-3 rounded-xl font-black text-lg transition-all ${config.vehicle.numberOfVehicles === n ? 'bg-amber-600 text-white shadow-lg' : 'bg-white border-2 border-amber-200 text-amber-700 hover:border-amber-400'}`}>
                            {n} {n === 1 ? 'Vehicle' : 'Vehicles'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="block text-sm font-black uppercase text-stone-600 mb-4">Select Vehicle Type</label>
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {VEHICLE_OPTIONS.map(v => (
                      <motion.div 
                        variants={itemVariants}
                        key={v.id}
                        onClick={() => setConfig(prev => ({ 
                          ...prev, 
                          vehicle: { ...prev.vehicle, make: v.name, model: '', drivetrain: v.drivetain, fuelType: v.fuel, fuelConsumptionL100km: v.fuelL100km } 
                        }))}
                        className={`relative h-52 rounded-[2rem] overflow-hidden cursor-pointer group transition-all border-4 ${config.vehicle.make === v.name ? 'border-primary shadow-xl ring-4 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                      >
                        <img src={v.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={v.name} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vehicle/800/600'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent flex flex-col justify-end p-5">
                           <h4 className="font-black text-white text-base leading-tight">{v.name}</h4>
                           <p className="text-stone-300 text-xs font-medium mt-1 opacity-80 group-hover:opacity-100 transition line-clamp-2">{v.desc}</p>
                           <div className="flex gap-2 mt-2 flex-wrap">
                             <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[9px] font-black uppercase text-white">{v.drivetain}</span>
                             <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[9px] font-black uppercase text-white">{v.fuel}</span>
                             {v.fuelL100km > 0 && <span className="px-2 py-1 bg-emerald-500/80 backdrop-blur-md rounded text-[9px] font-black uppercase text-white">{v.fuelL100km}L/100km</span>}
                           </div>
                        </div>
                        {config.vehicle.make === v.name && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 bg-primary p-2 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Soul</h2>
                  <p className="text-stone-500 mb-6">Select your hyper-specific safari interests.</p>
                  
                  {config.selectedRegions.length === 0 ? (
                    <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-10 text-center">
                      <p className="text-stone-500 font-bold mb-2">No regions selected.</p>
                      <p className="text-stone-400 text-sm">Return to Step 1 (The Horizon) and select at least one destination to see available activities.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <label className="text-xs font-black uppercase text-stone-400 mb-4 block">Select Trip Mood</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {TRIP_MOODS.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, mood: m.name } }))}
                              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${config.logistics.mood === m.name ? 'border-amber-600 bg-amber-50 shadow-md' : 'border-stone-100 bg-stone-50 hover:border-amber-200'}`}
                            >
                              <m.icon className={`w-5 h-5 ${config.logistics.mood === m.name ? 'text-amber-600' : 'text-stone-400'}`} />
                              <div>
                                <h4 className="font-bold text-sm leading-tight">{m.name}</h4>
                                <p className="text-[10px] text-stone-500 font-medium">{m.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 mb-6 bg-stone-100 p-1.5 rounded-xl w-max border border-stone-200">
                        <button onClick={() => setActivitySort('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activitySort === 'all' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>All</button>
                        <button onClick={() => setActivitySort('free')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activitySort === 'free' ? 'bg-white shadow text-emerald-600' : 'text-stone-500'}`}><DollarSign className="w-3 h-3"/> Free & Low Cost</button>
                        <button onClick={() => setActivitySort('high_action')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activitySort === 'high_action' ? 'bg-white shadow text-orange-600' : 'text-stone-500'}`}><Activity className="w-3 h-3"/> High Action</button>
                      </div>

                      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-wrap gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {INTERESTS_CATALOG
                          .filter(i => config.selectedRegions.includes(i.region))
                          .filter(i => activitySort === 'all' || (activitySort === 'free' && (i.priceLevel === 'free' || i.priceLevel === 'low')) || (activitySort === 'high_action' && i.athleticNeed === 'high'))
                          .map(interest => (
                          <motion.button
                            variants={itemVariants}
                            key={interest.id}
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              selectedInterests: prev.selectedInterests.includes(interest.label)
                                ? prev.selectedInterests.filter(i => i !== interest.label)
                                : [...prev.selectedInterests, interest.label]
                            }))}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-start ${
                              config.selectedInterests.includes(interest.label)
                                ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/20'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-200 hover:shadow-md'
                            }`}
                          >
                            <span>{interest.label}</span>
                            <span className={`text-[9px] uppercase tracking-wider mt-1 opacity-80`}>
                              {interest.category} • {interest.priceLevel === 'free' ? 'Free' : interest.priceLevel === 'low' ? '$' : interest.priceLevel === 'med' ? '$$' : '$$$'}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">Logistics</h2>
                  <p className="text-stone-500 mb-8">Final structural details.</p>
                  
                  {(() => {
                    const totalBudget = config.travelers.reduce((acc, t) => acc + (t.budget || 0), 0);
                    const days = config.logistics.days || 1;
                    const dailyBudget = totalBudget / days;
                    const warningValue = getBudgetWarningValue();
                    
                    if (dailyBudget < warningValue && totalBudget > 0) {
                      return (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm">
                           <div className="flex items-start">
                             <div className="flex-shrink-0">
                               <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <div className="ml-3">
                               <p className="text-sm font-black text-red-800">
                                 Budget Warning: {getCurrencySymbol()}{Math.round(dailyBudget)}/day for the group is extremely low.
                               </p>
                               <p className="text-xs text-red-700 mt-1 font-medium leading-relaxed">
                                 Namibian distances are vast and fuel is expensive. Consider adding more budget or relying strictly on Hitchhiking & Wild Camping.
                               </p>
                             </div>
                           </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-stone-400">Days</label>
                      <input 
                        type="number" 
                        className="w-full p-4 border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition rounded-xl font-bold"
                        value={config.logistics.days}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, days: Number(e.target.value) } }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-stone-400">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input 
                          type="date" 
                          className="w-full p-4 pl-12 border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition rounded-xl font-bold"
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
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-stone-400">End Date (Calculated)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 opacity-50" />
                        <input 
                          type="date" 
                          readOnly
                          className="w-full p-4 pl-12 border border-stone-200 bg-stone-50 text-stone-500 outline-none transition rounded-xl font-bold"
                          value={config.logistics.endDate || ''}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black uppercase text-stone-400">Expedition Starting Point</label>
                      <LocationInput
                        value={config.logistics.startingLocation || ''}
                        onChange={val => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, startingLocation: val } }))}
                        onSelect={(s: LocationSuggestion) => {
                          setConfig(prev => ({ 
                            ...prev, 
                            logistics: { ...prev.logistics, startingLocation: s.display_name } 
                          }));
                        }}
                        placeholder="e.g. Windhoek Airport, your hotel name, or city"
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black uppercase text-stone-400">Total Group Budget (Calculated)</label>
                      <div className="w-full p-4 border border-stone-200 rounded-xl font-black text-xl bg-stone-100/50 text-stone-700 shadow-inner">
                        {getCurrencySymbol()}{config.travelers.reduce((acc, t) => acc + (t.budget || 0), 0).toLocaleString()} <span className="text-sm text-stone-400 font-bold ml-1">{preferredCurrency}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-black uppercase text-stone-400">Budget Priorities</label>
                      <div className="flex flex-wrap gap-3">
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
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                              config.logistics.budgetPriorities?.includes(priority)
                                ? 'bg-amber-600 border-amber-600 text-white shadow-lg'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-200'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3 mt-4">
                      <label className="text-xs font-black uppercase text-stone-400">Travel Pace</label>
                      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {PACE_OPTIONS.map(p => (
                          <motion.div 
                            variants={itemVariants}
                            key={p.id}
                            onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, pace: p.label } }))}
                            className={`relative h-32 rounded-2xl overflow-hidden cursor-pointer group transition-all border-4 ${config.logistics.pace === p.label ? 'border-primary shadow-xl ring-2 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                          >
                            <img src={p.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-80" alt={p.label} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/pace/400/300'; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent flex flex-col justify-end p-4">
                               <p className="text-white text-sm font-bold leading-tight">{p.label}</p>
                            </div>
                            {config.logistics.pace === p.label && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 bg-primary p-1.5 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Stay</h2>
                  <p className="text-stone-500 mb-8">What type of homes or camps fit your vision?</p>

                  <div className="mb-10 bg-stone-50 p-6 rounded-[2rem] border border-stone-200">
                     <label className="block text-sm font-black uppercase text-stone-600 mb-4">Trip Style: Nomadic or Basecamp?</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'nomadic' } }))}
                          className={`p-6 border-4 rounded-2xl text-left transition-all ${(!config.logistics.stayStyle || config.logistics.stayStyle === 'nomadic') ? 'border-primary bg-white shadow-xl' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                        >
                           <MapPin className={`w-8 h-8 mb-3 ${(!config.logistics.stayStyle || config.logistics.stayStyle === 'nomadic') ? 'text-primary' : 'text-stone-400'}`} />
                           <h4 className="font-black text-xl mb-1 text-stone-900">Multi-Stop Journey</h4>
                           <p className="text-sm font-medium text-stone-500">Move between different lodges and regions as you explore.</p>
                        </button>
                        <button 
                          onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'basecamp' } }))}
                          className={`p-6 border-4 rounded-2xl text-left transition-all ${config.logistics.stayStyle === 'basecamp' ? 'border-primary bg-white shadow-xl' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                        >
                           <Home className={`w-8 h-8 mb-3 ${config.logistics.stayStyle === 'basecamp' ? 'text-primary' : 'text-stone-400'}`} />
                           <h4 className="font-black text-xl mb-1 text-stone-900">Single Basecamp</h4>
                           <p className="text-sm font-medium text-stone-500">Stay at ONE accommodation for the whole trip and take day drives.</p>
                        </button>
                     </div>
                  </div>
                  
                  <div className="mb-8 p-8 bg-blue-50 border border-blue-100 rounded-[2rem] shadow-sm">
                    <label className="block text-sm font-black uppercase text-blue-900 mb-2 flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-blue-600" /> Have a specific lodging booked?
                    </label>
                    <p className="text-blue-700/80 text-sm mb-4 font-medium">Enter its exact name so our AI can lock it in and plan around it. If you enter this, we will skip picking general lodging tiers.</p>
                    <input 
                      type="text" 
                      placeholder="e.g. Sossusvlei Lodge, or Airbnb in Swakopmund" 
                      className="w-full p-4 border border-blue-200 rounded-xl font-bold text-stone-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition shadow-inner"
                      value={config.logistics.specificAccommodation || ''}
                      onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, specificAccommodation: e.target.value } }))}
                    />
                  </div>

                  <AnimatePresence>
                    {!config.logistics.specificAccommodation ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="text-xs font-black uppercase text-stone-400 mb-4 block">Recommended Lodging Tier & Style</label>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          {BUDGET_OPTIONS.map(b => (
                            <motion.div 
                              variants={itemVariants}
                              key={b.id}
                              onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, budget: b.label } }))}
                              className={`relative h-28 rounded-2xl overflow-hidden cursor-pointer group transition-all border-4 ${config.logistics.budget === b.label ? 'border-primary shadow-xl ring-2 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                            >
                              <img src={b.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-80" alt={b.label} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/budget/400/300'; }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent flex flex-col justify-end p-4">
                                 <p className="text-white text-sm font-bold leading-tight">{b.label}</p>
                              </div>
                              {config.logistics.budget === b.label && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 bg-primary p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></motion.div>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-[2rem]">
                        <Home className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-black text-emerald-800 mb-2">Lodging Locked In</h4>
                        <p className="text-emerald-700 font-medium">
                          You provided a specific accommodation. The engine will bypass general category selection and explicitly route your expedition around this base.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-100 flex justify-between items-center relative z-10">
          <button 
            disabled={step === 1}
            onClick={back}
            className="flex items-center gap-2 font-bold text-stone-500 hover:text-stone-900 transition disabled:opacity-0"
          >
            <ChevronLeft /> Back
          </button>
          {step < 6 ? (
            <button 
              onClick={next}
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
            >
              Next <ChevronRight />
            </button>
          ) : (
            <button 
              disabled={isLoading || isSpinning}
              onClick={handleGenerateClick}
              className="px-10 py-4 bg-primary text-white rounded-xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition hover:scale-105 active:scale-95 disabled:animate-pulse disabled:hover:scale-100"
            >
              {isLoading ? 'Architecting...' : isSpinning ? 'Running Roulette...' : 'Generate Journey'} <Plane className="w-6 h-6" />
            </button>
          )}
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
