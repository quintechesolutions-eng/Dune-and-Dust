import React, { useState, useEffect } from 'react';
import { 
  MapPin, Users, Car, Heart, Settings, Plus, Trash2, Fuel, 
  ChevronRight, ChevronLeft, Plane, Map as MapIcon, CheckCircle2, Home 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NAMIBIA_REGIONS, DIETARY_OPTIONS, PACE_OPTIONS, BUDGET_OPTIONS, DETAIL_LEVELS, MONTHS, INTERESTS_CATALOG, VEHICLE_OPTIONS, STARTING_LOCATIONS, ACCOMMODATION_STYLES } from '../constants';
import { TripConfig, Traveler } from '../types';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

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
             Hover over the map zones to preview regions.<br/>Click to plot them on your horizon.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Wizard: React.FC<WizardProps> = ({ onGenerate, isLoading }) => {
  const [user] = useAuthState(auth);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<TripConfig>({
    selectedRegions: [],
    travelers: [{ id: 1, name: 'Explorer 1', age: 30, hasLicense: true, dietary: 'None (Omnivore)', budgetUsd: 1500 }],
    vehicle: { rentalMode: 'rental', make: VEHICLE_OPTIONS[0].name, model: '', drivetrain: VEHICLE_OPTIONS[0].drivetain, fuelType: VEHICLE_OPTIONS[0].fuel },
    selectedInterests: [],
    logistics: {
      days: 10,
      month: 'September',
      budget: 'Mid-Range (Standard Lodges, B&Bs, Glamping)',
      budgetPriorities: [],
      pace: 'Moderate (The standard balance of driving and doing)',
      detailLevel: 'standard',
      startingLocation: STARTING_LOCATIONS[0],
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

  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<string[]>([]);
  const [currentRouletteDisplay, setCurrentRouletteDisplay] = useState('');

  const next = () => setStep(s => Math.min(6, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleGenerateClick = () => {
    if (config.selectedRegions.length > config.logistics.days && config.logistics.days > 0) {
      // Need to spin
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
    } else {
      onGenerate({ ...config, baseCurrency: preferredCurrency });
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className="flex-1 flex items-center group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all flex-shrink-0 border-2 ${step >= s ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-stone-200 text-stone-400'}`}>
              {s}
            </div>
            {s < 6 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-amber-600' : 'bg-stone-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden">
        <div className="p-8 md:p-12 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2 flex flex-col">
                    <h2 className="text-3xl font-black mb-2">The Canvas</h2>
                    <p className="text-stone-500 mb-8">Click areas on the map to plot your journey.</p>
                    
                    {config.selectedRegions.length > config.logistics.days && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                        <strong>Warning:</strong> You have selected {config.selectedRegions.length} regions but only have {config.logistics.days} days. This may cause the system to drop locations randomly during generation or produce an impossible itinerary. Consider increasing your trip duration conceptually.
                      </div>
                    )}
                    
                    <div className="relative w-full aspect-[4/5] bg-[#E8E6E1] rounded-[3rem] shadow-inner border border-stone-200 overflow-hidden flex-1 group">
                      <Map
                        initialViewState={{
                          longitude: 17.5,
                          latitude: -22.5,
                          zoom: 4.2
                        }}
                        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                        interactive={true}
                        attributionControl={false}
                      >
                         {NAMIBIA_REGIONS.map(r => {
                           const isSelected = config.selectedRegions.includes(r.id);
                           return (
                             <Marker 
                               key={r.id} 
                               longitude={r.lng!} 
                               latitude={r.lat!}
                               anchor="center"
                               onClick={(e) => {
                                 e.originalEvent.stopPropagation();
                                 toggleRegion(r.id);
                               }}
                             >
                                <div 
                                  className={`relative group cursor-pointer transition-transform duration-300 hover:scale-125 z-10`}
                                  onMouseEnter={() => {
                                     const event = new CustomEvent('regionHover', { detail: r });
                                     window.dispatchEvent(event);
                                  }}
                                  onMouseLeave={() => {
                                     const event = new CustomEvent('regionHover', { detail: null });
                                     window.dispatchEvent(event);
                                  }}
                                >
                                   {isSelected && (
                                     <div className="absolute -inset-2 bg-primary rounded-full animate-pulse opacity-30"></div>
                                   )}
                                   <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-white scale-110' : 'bg-white border-stone-300 rotate-0'}`}>
                                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-white" /> : <r.icon className="w-4 h-4 text-stone-600" />}
                                   </div>
                                </div>
                             </Marker>
                           );
                         })}
                      </Map>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 flex flex-col">
                     <RegionDetailsPanel isSelected={config.selectedRegions} />
                     <div className="mt-8">
                       <h4 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4">Selected Waypoints</h4>
                       <div className="flex flex-wrap gap-2 min-h-[40px]">
                         {config.selectedRegions.length === 0 ? <span className="text-stone-400 text-sm font-bold">None selected yet.</span> : null}
                         {NAMIBIA_REGIONS.filter(r => config.selectedRegions.includes(r.id)).map(r => (
                           <span key={r.id} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20">
                             {r.name}
                             <button onClick={() => toggleRegion(r.id)} className="hover:bg-white/20 p-1 rounded-full"><Trash2 className="w-3 h-3" /></button>
                           </span>
                         ))}
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Crew</h2>
                  <p className="text-stone-500 mb-8">Who are your fellow explorers?</p>
                  
                  {config.travelers.length > 0 && config.travelers.every(t => t.age > 0 && t.age < 18) && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm flex items-start gap-3">
                      <div className="mt-1 font-black">!</div>
                      <p><strong>Heads Up:</strong> Your entire crew consists of minors under 18. While exciting, independent travel for unaccompanied minors in Namibia carries significant logistical and safety restrictions (especially for driving and border crossings). We won't stop you from planning, but please verify legal travel requirements.</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {config.travelers.map((t, idx) => (
                      <div key={t.id} className="p-6 bg-stone-50 rounded-2xl relative border border-stone-200">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Explorer Name</label>
                            <input 
                              placeholder="Name" 
                              className="w-full p-3 border rounded-xl"
                              value={t.name || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev,
                                travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, name: e.target.value } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Age</label>
                            <input 
                              type="number" 
                              placeholder="Age" 
                              className="w-full p-3 border rounded-xl"
                              value={t.age || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev,
                                travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, age: Number(e.target.value) } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Budget ({preferredCurrency})</label>
                            <input 
                              type="number" 
                              placeholder={`Budget in ${preferredCurrency}`} 
                              className="w-full p-3 border rounded-xl"
                              value={t.budgetUsd || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev,
                                travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, budgetUsd: Number(e.target.value) } : tr)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Dietary Requirement</label>
                            <select 
                              className="w-full p-3 border rounded-xl"
                              value={t.dietary || ''}
                              onChange={e => setConfig(prev => ({
                                ...prev,
                                travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, dietary: e.target.value } : tr)
                              }))}
                            >
                              {DIETARY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-stone-400 pl-1">Can Drive?</label>
                            <div className="flex h-[50px] items-center gap-2 px-3 bg-white border rounded-xl">
                              <input 
                                type="checkbox" 
                                checked={t.hasLicense}
                                onChange={e => setConfig(prev => ({
                                  ...prev,
                                  travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, hasLicense: e.target.checked } : tr)
                                }))}
                              />
                              <span className="text-sm font-bold text-stone-600">Driver</span>
                            </div>
                          </div>
                        </div>
                        {config.travelers.length > 1 && (
                          <button 
                            onClick={() => setConfig(prev => ({ ...prev, travelers: prev.travelers.filter(tr => tr.id !== t.id) }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        travelers: [...prev.travelers, { id: Date.now(), name: '', age: 30, hasLicense: false, dietary: 'None (Omnivore)', budgetUsd: 1500 }]
                      }))}
                      className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-stone-400 font-bold hover:bg-stone-50 transition flex items-center justify-center gap-2"
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
                  
                  <div className="mb-8">
                    <label className="block text-sm font-black uppercase text-stone-600 mb-2">Acquisition Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button onClick={() => setConfig({ ...config, vehicle: { ...config.vehicle, rentalMode: 'rental' } })} className={`p-6 rounded-2xl border-2 text-left transition-all ${config.vehicle.rentalMode === 'rental' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' : 'border-stone-200 hover:border-stone-300'}`}>
                         <h4 className="font-black text-lg mb-1 flex items-center gap-2"><Car className="w-5 h-5" /> Book a Rental</h4>
                         <p className="text-sm font-medium text-stone-500">Pick up a fully equipped vehicle upon landing.</p>
                       </button>
                       <button onClick={() => setConfig({ ...config, vehicle: { ...config.vehicle, rentalMode: 'own' } })} className={`p-6 rounded-2xl border-2 text-left transition-all ${config.vehicle.rentalMode === 'own' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' : 'border-stone-200 hover:border-stone-300'}`}>
                         <h4 className="font-black text-lg mb-1 flex items-center gap-2"><Home className="w-5 h-5" /> Self-Owned</h4>
                         <p className="text-sm font-medium text-stone-500">I will be driving my own or a locally supplied car.</p>
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VEHICLE_OPTIONS.map(v => (
                      <div 
                        key={v.id}
                        onClick={() => setConfig(prev => ({ 
                          ...prev, 
                          vehicle: { ...prev.vehicle, make: v.name, model: '', drivetrain: v.drivetain, fuelType: v.fuel } 
                        }))}
                        className={`relative h-48 rounded-[2rem] overflow-hidden cursor-pointer group transition-all border-4 ${config.vehicle.make === v.name ? 'border-primary shadow-xl ring-4 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                      >
                        <img src={v.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={v.name} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vehicle/800/600'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent flex flex-col justify-end p-6">
                           <h4 className="font-black text-white text-lg">{v.name}</h4>
                           <p className="text-stone-300 text-xs font-medium mb-1">{v.desc}</p>
                           <span className="inline-block px-2 py-1 bg-stone-800/80 rounded text-[10px] font-black uppercase text-stone-200 mt-2 w-max">
                             {v.drivetain} • {v.fuel}
                           </span>
                        </div>
                        {config.vehicle.make === v.name && (
                          <div className="absolute top-4 right-4 bg-primary p-2 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Soul</h2>
                  <p className="text-stone-500 mb-8">Select your hyper-specific safari interests.</p>
                  
                  {config.selectedRegions.length === 0 ? (
                    <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center">
                      <p className="text-stone-500 font-bold mb-2">No regions selected.</p>
                      <p className="text-stone-400 text-sm">Return to Step 1 (The Horizon) and select at least one destination to see available activities.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {INTERESTS_CATALOG.filter(i => config.selectedRegions.includes(i.region)).map(interest => (
                        <button
                          key={interest.label}
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            selectedInterests: prev.selectedInterests.includes(interest.label)
                              ? prev.selectedInterests.filter(i => i !== interest.label)
                              : [...prev.selectedInterests, interest.label]
                          }))}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                            config.selectedInterests.includes(interest.label)
                              ? 'bg-amber-600 border-amber-600 text-white shadow-lg'
                              : 'bg-white border-stone-100 text-stone-600 hover:border-amber-200'
                          }`}
                        >
                          {interest.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">Logistics</h2>
                  <p className="text-stone-500 mb-8">Final structural details.</p>
                  
                  {(() => {
                    const totalBudget = config.travelers.reduce((acc, t) => acc + (t.budgetUsd || 0), 0);
                    const days = config.logistics.days || 1;
                    const dailyBudget = totalBudget / days;
                    if (dailyBudget < 60 && totalBudget > 0) {
                      return (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                           <div className="flex items-start">
                             <div className="flex-shrink-0">
                               <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <div className="ml-3">
                               <p className="text-sm font-bold text-red-800">
                                 Budget Warning: ${Math.round(dailyBudget)}/day for the group is extremely low.
                               </p>
                               <p className="text-xs text-red-700 mt-1">
                                 Namibian distances are vast and fuel is expensive. Consider adding more budget or relying strictly on Hitchhiking & Wild Camping.
                               </p>
                             </div>
                           </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Days</label>
                      <input 
                        type="number" 
                        className="w-full p-4 border rounded-xl font-bold"
                        value={config.logistics.days}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, days: Number(e.target.value) } }))}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Month</label>
                      <select 
                        className="w-full p-4 border rounded-xl font-bold"
                        value={config.logistics.month}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, month: e.target.value } }))}
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Total Group Budget (Calculated)</label>
                      <div className="w-full p-4 border rounded-xl font-bold bg-stone-100/50 text-stone-600">
                        ${config.travelers.reduce((acc, t) => acc + (t.budgetUsd || 0), 0).toLocaleString()} {preferredCurrency}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
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
                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
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
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Travel Pace</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {PACE_OPTIONS.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, pace: p.label } }))}
                            className={`relative h-32 rounded-xl overflow-hidden cursor-pointer group transition-all border-4 ${config.logistics.pace === p.label ? 'border-primary shadow-xl ring-2 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                          >
                            <img src={p.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-70" alt={p.label} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/pace/400/300'; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent flex flex-col justify-end p-4">
                               <p className="text-white text-xs font-bold leading-tight">{p.label}</p>
                            </div>
                            {config.logistics.pace === p.label && (
                              <div className="absolute top-2 right-2 bg-primary p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Recommended Lodging Tier</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {BUDGET_OPTIONS.map(b => (
                          <div 
                            key={b.id}
                            onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, budget: b.label } }))}
                            className={`relative h-24 rounded-xl overflow-hidden cursor-pointer group transition-all border-4 ${config.logistics.budget === b.label ? 'border-primary shadow-xl ring-2 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                          >
                            <img src={b.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-70" alt={b.label} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/budget/400/300'; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent flex flex-col justify-end p-4">
                               <p className="text-white text-xs font-bold leading-tight">{b.label}</p>
                            </div>
                            {config.logistics.budget === b.label && (
                              <div className="absolute top-2 right-2 bg-primary p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Starting Location</label>
                      <select 
                        className="w-full p-4 border rounded-xl font-bold"
                        value={config.logistics.startingLocation}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, startingLocation: e.target.value } }))}
                      >
                        {STARTING_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Stay</h2>
                  <p className="text-stone-500 mb-8">What type of homes or camps fit your vision?</p>

                  <div className="mb-8 space-y-4">
                     <label className="block text-sm font-black uppercase text-stone-600 mb-2">Trip Style: Nomadic or Basecamp?</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'nomadic' } }))}
                          className={`p-6 border-2 rounded-2xl text-left transition-all ${(!config.logistics.stayStyle || config.logistics.stayStyle === 'nomadic') ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' : 'border-stone-200 hover:border-stone-300'}`}
                        >
                           <h4 className="font-black text-lg mb-1 flex items-center gap-2"><MapPin className="w-5 h-5" /> Multi-Stop Journey</h4>
                           <p className="text-sm font-medium text-stone-500">Move between different lodges and regions as you explore.</p>
                        </button>
                        <button 
                          onClick={() => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, stayStyle: 'basecamp' } }))}
                          className={`p-6 border-2 rounded-2xl text-left transition-all ${config.logistics.stayStyle === 'basecamp' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' : 'border-stone-200 hover:border-stone-300'}`}
                        >
                           <h4 className="font-black text-lg mb-1 flex items-center gap-2"><Home className="w-5 h-5" /> Single Basecamp</h4>
                           <p className="text-sm font-medium text-stone-500">Stay at ONE accommodation for the whole trip and take day drives.</p>
                        </button>
                     </div>
                  </div>
                  
                  <div className="mb-8 p-6 bg-stone-50 border border-stone-200 rounded-[2rem]">
                    <label className="block text-sm font-black uppercase text-stone-600 mb-2">Have a specific lodge, house, or Airbnb in mind?</label>
                    <p className="text-stone-500 text-sm mb-4">Enter its exact name and location so our AI can verify it and weave it into the route.</p>
                    <input 
                      type="text" 
                      placeholder="e.g. Sossusvlei Lodge, or specific Airbnb name in Swakopmund" 
                      className="w-full p-4 border rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      value={config.logistics.specificAccommodation || ''}
                      onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, specificAccommodation: e.target.value } }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {ACCOMMODATION_STYLES.map(style => (
                      <div 
                        key={style.id}
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          logistics: {
                            ...prev.logistics,
                            accommodationStyles: prev.logistics.accommodationStyles.includes(style.name)
                              ? prev.logistics.accommodationStyles.filter(s => s !== style.name)
                              : [...prev.logistics.accommodationStyles, style.name]
                          }
                        }))}
                        className={`relative h-48 rounded-[2rem] overflow-hidden cursor-pointer group transition-all border-4 ${config.logistics.accommodationStyles.includes(style.name) ? 'border-primary shadow-xl ring-4 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                      >
                        <img src={style.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={style.name} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/accommodation/800/600'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent flex flex-col justify-end p-6">
                           <h3 className="text-xl font-black text-white">{style.name}</h3>
                           <p className="text-stone-300 text-xs font-medium leading-relaxed">{style.desc}</p>
                        </div>
                        {config.logistics.accommodationStyles.includes(style.name) && (
                          <div className="absolute top-4 right-4 bg-primary p-2 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 bg-stone-50 border-t flex justify-between">
          <button 
            disabled={step === 1}
            onClick={back}
            className="flex items-center gap-2 font-bold text-stone-500 hover:text-stone-900 transition disabled:opacity-30"
          >
            <ChevronLeft /> Back
          </button>
          {step < 6 ? (
            <button 
              onClick={next}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              Next <ChevronRight />
            </button>
          ) : (
            <button 
              disabled={isLoading || isSpinning}
              onClick={handleGenerateClick}
              className="px-12 py-4 bg-primary text-white rounded-xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition disabled:animate-pulse"
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
            className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-10 text-center">
               <h2 className="text-3xl font-black text-white mb-2">Location Roulette</h2>
               <p className="text-stone-300 font-medium">You selected more regions than days. We are randomly selecting the optimal {config.logistics.days} destinations for you!</p>
            </div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="mt-12 bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary"
            >
               <p className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter">{currentRouletteDisplay || '...'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
