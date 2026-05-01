import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Wizard } from './components/Wizard';
import { QuickTrip } from './components/QuickTrip';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';
import { SocialExplorer } from './components/SocialExplorer';
import { ItineraryView } from './components/ItineraryView';
import { generateItinerary, generateFromDescription } from './services/ai';
import { db, auth, signInWithGoogle } from './lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SavedItinerary, TripConfig, ItineraryData } from './types';
import { Compass, ArrowRight, Play, Loader2, Sparkles, Map as MapIcon, Car, CloudSun, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOADING_FACTS } from './constants';

import hero1 from './assets/media__1777652280508.jpg';
import hero2 from './assets/media__1777652280656.jpg';
import hero3 from './assets/media__1777652280689.jpg';
import hero4 from './assets/media__1777652280785.jpg';
import hero5 from './assets/media__1777652280860.jpg';
import hero6 from './assets/media__1777652360444.jpg';
import hero7 from './assets/media__1777652360468.jpg';

export default function App() {
  const [user, loadingAuth] = useAuthState(auth);
  const [view, setView] = useState('home'); 
  const [activeTrip, setActiveTrip] = useState<SavedItinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const handleReset = () => {
    setActiveTrip(null);
    setIsGenerating(false);
    window.history.pushState({}, '', '/');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('trip');
    if (tripId) {
      const fetchTrip = async () => {
        try {
          const snap = await getDoc(doc(db, 'itineraries', tripId));
          if (snap.exists()) {
            setActiveTrip({ id: snap.id, ...snap.data() } as SavedItinerary);
            setView('results');
          }
        } catch (error) {
          console.error("Deep link fetch error:", error);
          alert("The expedition logs for this journey are restricted or missing.");
        }
      };
      fetchTrip();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % LOADING_FACTS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (config: TripConfig) => {
    setIsGenerating(true);
    try {
      const result = await generateItinerary(config);
      
      let finalTrip: SavedItinerary;
      
      if (user) {
        const docRef = await addDoc(collection(db, 'itineraries'), {
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          days: config.logistics.days,
          month: config.logistics.month,
          budget: config.logistics.budget,
          pace: config.logistics.pace,
          detailLevel: config.logistics.detailLevel,
          baseCurrency: config.baseCurrency || 'USD',
          config: config,
          data: result,
          likes: 0,
          isPublic: false,
          createdAt: serverTimestamp()
        });
        
        finalTrip = {
          id: docRef.id,
          userId: user.uid,
          userName: user.displayName || 'Explorer',
          userPhoto: user.photoURL || '',
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          data: result,
          config: { ...config, baseCurrency: config.baseCurrency || 'USD' },
          likes: 0,
          isPublic: false,
          createdAt: new Date() 
        };
      } else {
        // Temporary preview for non-signed in users
        finalTrip = {
          id: 'preview',
          userId: 'anonymous',
          userName: 'Explorer',
          userPhoto: '',
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          data: result,
          likes: 0,
          isPublic: false,
          createdAt: new Date()
        };
      }

      setActiveTrip(finalTrip);
      setView('results');
    } catch (error) {
      console.error(error);
      alert("The desert winds were too strong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async (description: string, currency: string) => {
    setIsGenerating(true);
    try {
      const result = await generateFromDescription(description, currency);

      let finalTrip: SavedItinerary;

      if (user) {
        const docRef = await addDoc(collection(db, 'itineraries'), {
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          data: result,
          baseCurrency: currency,
          config: { baseCurrency: currency },
          likes: 0,
          isPublic: false,
          createdAt: serverTimestamp()
        });

        finalTrip = {
          id: docRef.id,
          userId: user.uid,
          userName: user.displayName || 'Explorer',
          userPhoto: user.photoURL || '',
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          data: result,
          config: { baseCurrency: currency } as any,
          likes: 0,
          isPublic: false,
          createdAt: new Date()
        };
      } else {
        finalTrip = {
          id: 'preview',
          userId: 'anonymous',
          userName: 'Explorer',
          userPhoto: '',
          title: result.tripSummary.headline,
          overview: result.tripSummary.overview,
          data: result,
          config: { baseCurrency: currency } as any,
          likes: 0,
          isPublic: false,
          createdAt: new Date()
        };
      }

      setActiveTrip(finalTrip);
      setView('results');
    } catch (error) {
      console.error(error);
      alert("The desert winds were too strong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const Landing = () => {
    const images = [hero1, hero2, hero3, hero4, hero5, hero6, hero7];
    const vehicles = [
      { name: "LAND CRUISER", series: "SERIES 79", spec: "V8 DIESEL 4.5L" },
      { name: "TOYOTA HILUX", series: "GR SPORT", spec: "2.8 GD-6 4X4" },
      { name: "TOYOTA FORTUNER", series: "4X4 LEGENDER", spec: "2.8 GD-6 4X4" },
      { name: "FORD RANGER", series: "WILDTRAK", spec: "3.0 V6 DIESEL" },
      { name: "TOYOTA RAV4", series: "VX AWD", spec: "2.5 HYBRID 4X4" }
    ];

    const cities = [
      { name: "WINDHOEK", lat: -22.56, lon: 17.08 },
      { name: "SWAKOPMUND", lat: -22.68, lon: 14.53 },
      { name: "ONDANGWA", lat: -17.91, lon: 15.97 },
      { name: "RUNDU", lat: -17.91, lon: 19.76 },
      { name: "WALVIS BAY", lat: -22.95, lon: 14.51 },
      { name: "LUDERITZ", lat: -26.65, lon: 15.15 },
      { name: "KATIMA MULILO", lat: -17.50, lon: 24.27 }
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
    const [currentCityIndex, setCurrentCityIndex] = useState(0);
    const [weather, setWeather] = useState<{ temp: number } | null>(null);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
        setCurrentVehicleIndex(prev => (prev + 1) % vehicles.length);
        setCurrentCityIndex(prev => (prev + 1) % cities.length);
      }, 5000);
      return () => clearInterval(interval);
    }, [images.length, vehicles.length, cities.length]);

    useEffect(() => {
      const fetchWeather = async () => {
        try {
          const city = cities[currentCityIndex];
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
          const data = await res.json();
          setWeather({ temp: Math.round(data.current_weather.temperature) });
        } catch (e) {
          console.error("Weather fetch failed:", e);
        }
      };
      fetchWeather();
    }, [currentCityIndex]);

    return (
      <div className="relative min-h-[calc(100vh-64px)] bg-white overflow-hidden selection:bg-blue-100">
        {/* Background Slideshow (B&W Scrolling) */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.15, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute inset-0 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white"></div>
        </div>

        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/topography.png')]"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Text & CTAs */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-blue-600"></div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">NAMIBIAN EXPEDITION ENGINE</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-stone-900 leading-[0.9] mb-8 tracking-tighter">
                ARCHITECT <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-stone-400">YOUR MIGRATION.</span>
              </h1>
              
              <p className="text-xl text-stone-500 font-medium mb-12 leading-relaxed max-w-xl">
                The world's most advanced tactical safari planner. Precision-engineered itineraries, real-time logistics, and high-fidelity mapping for the modern explorer.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={() => setView('wizard')}
                  className="w-full sm:w-auto px-10 py-5 bg-stone-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                  Initiate Plan <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                
                <button 
                  onClick={() => setView('quicktrip')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-stone-900 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-stone-200 hover:border-stone-900 flex items-center justify-center gap-3 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" /> 
                  Describe Journey
                </button>
              </div>
            </motion.div>

            {/* Right Column: Floating UI Stack */}
            <div className="lg:col-span-6 relative h-[600px] mt-20 lg:mt-0">
               {/* Decorative Circles */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
               
               {/* Floating Map Piece (B&W) */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
                 animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                 transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                 className="absolute top-0 right-0 w-80 h-80 bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-stone-100 p-2 z-20 overflow-hidden group hover:-translate-y-4 transition-transform duration-700 cursor-pointer"
               >
                   <div className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${images[currentImageIndex]})` }}></div>
                   <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent"></div>
                   <div className="absolute bottom-8 left-8 right-8">
                     <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-2">
                       <MapIcon className="w-3 h-3 text-blue-500" /> TACTICAL VIEW
                     </div>
                     <div className="text-white font-black text-2xl tracking-tighter uppercase italic">EXPEDITION {currentImageIndex + 1}</div>
                   </div>
               </motion.div>

               {/* Floating Vehicle Card (Fleet Flip) */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, x: -50, y: 20 }}
                 animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                 transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                 className="absolute top-32 left-0 w-72 h-80 bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-stone-100 p-10 z-30 group hover:-translate-y-4 transition-transform duration-700 cursor-pointer"
               >
                  <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors shadow-xl shadow-stone-900/20">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3">FLEET MANIFEST</div>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentVehicleIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-1"
                    >
                      <div className="text-2xl font-black text-stone-900 tracking-tighter leading-none uppercase italic">{vehicles[currentVehicleIndex].name}</div>
                      <div className="text-sm font-black text-blue-600 tracking-tight uppercase">{vehicles[currentVehicleIndex].series}</div>
                      <div className="text-[10px] font-bold text-stone-400 mt-2">{vehicles[currentVehicleIndex].spec}</div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="flex gap-1 mt-10">
                    {vehicles.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i === currentVehicleIndex ? 'bg-blue-600 w-4' : 'bg-stone-100'}`} />
                    ))}
                  </div>
               </motion.div>

               {/* Floating Weather/Status Widget (Weather Library) */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, y: 80 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="absolute bottom-10 right-10 w-64 bg-stone-900 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] p-8 z-40 group hover:-translate-y-4 transition-transform duration-700 cursor-pointer"
               >
                   <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <CloudSun className="w-6 h-6 text-amber-500 animate-pulse" />
                    </div>
                    <div className="text-right">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCityIndex}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          <div className="text-white font-black text-3xl tracking-tighter leading-none">{weather ? `${weather.temp}°C` : '--'}</div>
                          <div className="text-stone-500 text-[9px] font-black uppercase tracking-widest mt-1">{cities[currentCityIndex].name}</div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase tracking-widest">
                      <span>ATMOSPHERE</span>
                      <span>OPTIMAL</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: weather ? `${(weather.temp/45)*100}%` : '50%' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-amber-500" 
                      />
                    </div>
                  </div>
               </motion.div>

               {/* Geometric Accents */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-stone-100 rounded-full -z-20 opacity-50"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] border border-stone-50 rounded-full -z-20 opacity-30"></div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  if (loadingAuth) return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center">
      <Compass className="w-16 h-16 text-amber-500 animate-spin mb-4" />
      <p className="text-stone-500 font-black text-xs uppercase tracking-widest">Waking our Guides...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200">
      <Navigation onNav={setView} onReset={handleReset} currentView={view} />

      <main className={view === 'home' ? '' : 'main-canvas pt-8 pb-20'}>
        <AnimatePresence mode="wait">
          {view === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Landing /></motion.div>}
          {view === 'wizard' && <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Wizard onGenerate={handleGenerate} isLoading={isGenerating} /></motion.div>}
          {view === 'quicktrip' && <motion.div key="quicktrip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><QuickTrip onGenerate={handleQuickGenerate} onSwitchToWizard={() => setView('wizard')} isLoading={isGenerating} /></motion.div>}
          {view === 'dashboard' && <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Dashboard onViewTrip={(trip) => { setActiveTrip(trip); setView('results'); }} /></motion.div>}
          {view === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UserProfile /></motion.div>}
          {view === 'social' && <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SocialExplorer /></motion.div>}
          {view === 'results' && activeTrip && <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ItineraryView trip={activeTrip} onBack={() => setView('dashboard')} /></motion.div>}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-amber-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
               <Compass className="w-24 h-24 text-amber-500 animate-[spin_4s_linear_infinite] relative z-10" />
            </div>
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">Architecting your legacy...</h2>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] max-w-xl w-full relative overflow-hidden min-h-[120px] flex items-center justify-center">
              <p className="text-stone-300 text-xl font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {LOADING_FACTS[factIndex]}
              </p>
            </div>
            <div className="mt-12 flex gap-2">
              {[0,1,2].map(i => <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 bg-amber-500 rounded-full" />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
