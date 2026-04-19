import React, { useState } from 'react';
import { 
  MapPin, Users, Car, Heart, Settings, Plus, Trash2, Fuel, 
  ChevronRight, ChevronLeft, Plane, Map as MapIcon, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAMIBIA_REGIONS, DIETARY_OPTIONS, PACE_OPTIONS, BUDGET_OPTIONS, DETAIL_LEVELS, MONTHS, INTERESTS_CATALOG, VEHICLE_OPTIONS } from '../constants';
import { TripConfig, Traveler } from '../types';

interface WizardProps {
  onGenerate: (config: TripConfig) => void;
  isLoading: boolean;
}

export const Wizard: React.FC<WizardProps> = ({ onGenerate, isLoading }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<TripConfig>({
    selectedRegions: [],
    travelers: [{ id: 1, name: 'Explorer 1', age: 30, hasLicense: true, dietary: 'None (Omnivore)', budgetUsd: 1500 }],
    vehicle: { make: VEHICLE_OPTIONS[0].name, model: '', drivetrain: VEHICLE_OPTIONS[0].drivetain, fuelType: VEHICLE_OPTIONS[0].fuel },
    selectedInterests: [],
    logistics: {
      days: 10,
      month: 'September',
      budget: 'Mid-Range (Standard Lodges, B&Bs, Glamping)',
      pace: 'Moderate (The standard balance of driving and doing)',
      detailLevel: 'standard'
    }
  });

  const toggleRegion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(id) 
        ? prev.selectedRegions.filter(r => r !== id) 
        : [...prev.selectedRegions, id]
    }));
  };

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex-1 flex items-center group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-stone-200 text-stone-400'}`}>
              {s}
            </div>
            {s < 5 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-amber-600' : 'bg-stone-200'}`} />}
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
                <div>
                  <h2 className="text-3xl font-black mb-2">The Canvas</h2>
                  <p className="text-stone-500 mb-8">Where in Namibia is calling you?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {NAMIBIA_REGIONS.map(r => (
                      <div 
                        key={r.id}
                        onClick={() => toggleRegion(r.id)}
                        className={`relative h-56 rounded-[2rem] overflow-hidden cursor-pointer group transition-all border-4 ${config.selectedRegions.includes(r.id) ? 'border-primary shadow-xl ring-4 ring-blue-50' : 'border-white shadow-sm hover:shadow-md'}`}
                      >
                        <img src={r.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={r.name} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/namibiasafari/800/600'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent flex flex-col justify-end p-8">
                          <div className="flex items-center gap-3 mb-2">
                             <r.icon className="w-5 h-5 text-primary" />
                             <h3 className="text-2xl font-black text-white">{r.name}</h3>
                          </div>
                          <p className="text-stone-300 text-sm font-medium leading-relaxed">{r.desc}</p>
                        </div>
                        {config.selectedRegions.includes(r.id) && (
                          <div className="absolute top-6 right-6 bg-primary p-2 rounded-full shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Crew</h2>
                  <p className="text-stone-500 mb-8">Who are your fellow explorers?</p>
                  <div className="space-y-4">
                    {config.travelers.map((t, idx) => (
                      <div key={t.id} className="p-6 bg-stone-50 rounded-2xl relative border border-stone-200">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <input 
                            placeholder="Name" 
                            className="p-3 border rounded-xl"
                            value={t.name || ''}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, name: e.target.value } : tr)
                            }))}
                          />
                          <input 
                            type="number" 
                            placeholder="Age" 
                            className="p-3 border rounded-xl"
                            value={t.age || ''}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, age: Number(e.target.value) } : tr)
                            }))}
                          />
                          <input 
                            type="number" 
                            placeholder="Budget P/P (USD)" 
                            className="p-3 border rounded-xl"
                            value={t.budgetUsd || ''}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, budgetUsd: Number(e.target.value) } : tr)
                            }))}
                          />
                          <select 
                            className="p-3 border rounded-xl"
                            value={t.dietary || ''}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              travelers: prev.travelers.map(tr => tr.id === t.id ? { ...tr, dietary: e.target.value } : tr)
                            }))}
                          >
                            {DIETARY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <div className="flex items-center gap-2 px-3 bg-white border rounded-xl">
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
                  <div className="grid grid-cols-1 gap-4">
                    {VEHICLE_OPTIONS.map(v => (
                      <div 
                        key={v.id}
                        onClick={() => setConfig(prev => ({ 
                          ...prev, 
                          vehicle: { make: v.name, model: '', drivetrain: v.drivetain, fuelType: v.fuel } 
                        }))}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                          config.vehicle.make === v.name
                            ? 'border-primary bg-blue-50'
                            : 'border-stone-100 hover:border-blue-200'
                        }`}
                      >
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-black text-stone-900">{v.name}</h4>
                               <p className="text-stone-500 text-sm">{v.desc}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-stone-400">{v.drivetain} • {v.fuel}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">The Soul</h2>
                  <p className="text-stone-500 mb-8">Select your hyper-specific safari interests.</p>
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
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="text-3xl font-black mb-2">Logistics</h2>
                  <p className="text-stone-500 mb-8">Final structural details.</p>
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
                        ${config.travelers.reduce((acc, t) => acc + (t.budgetUsd || 0), 0).toLocaleString()} USD
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Travel Pace</label>
                      <select 
                        className="w-full p-4 border rounded-xl font-bold"
                        value={config.logistics.pace}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, pace: e.target.value } }))}
                      >
                        {PACE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-black uppercase text-stone-400">Recommended Lodging Tier (Matches Crew Budget)</label>
                      <select 
                        className="w-full p-4 border rounded-xl font-bold"
                        value={config.logistics.budget}
                        onChange={e => setConfig(prev => ({ ...prev, logistics: { ...prev.logistics, budget: e.target.value } }))}
                      >
                        {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
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
          {step < 5 ? (
            <button 
              onClick={next}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              Next <ChevronRight />
            </button>
          ) : (
            <button 
              disabled={isLoading}
              onClick={() => onGenerate(config)}
              className="px-12 py-4 bg-primary text-white rounded-xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition disabled:animate-pulse"
            >
              {isLoading ? 'Architecting...' : 'Generate Journey'} <Plane className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
