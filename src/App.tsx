import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Wizard } from './components/Wizard';
import { Dashboard } from './components/Dashboard';
import { Leaderboard } from './components/Leaderboard';
import { UserProfile } from './components/UserProfile';
import { ItineraryView } from './components/ItineraryView';
import { generateItinerary } from './services/ai';
import { db, auth } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SavedItinerary, TripConfig, ItineraryData } from './types';
import { Compass, ArrowRight, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOADING_FACTS } from './constants';

export default function App() {
  const [user, loadingAuth] = useAuthState(auth);
  const [view, setView] = useState('home'); 
  const [activeTrip, setActiveTrip] = useState<SavedItinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

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

  const Landing = () => (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-bg-main px-6 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
             <Compass className="w-4 h-4" /> v1.0 MVP Stage
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-text-main leading-tight mb-6">
            Architect Your <br/>
            <span className="text-primary italic">Migration</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted font-medium mb-10 leading-relaxed max-w-xl">
            Precision safari planning engine designed for professional explorers. Build, share, and discover the ultimate Namibian expeditions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => setView('wizard')}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 group"
            >
              Start Expedition <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button 
               onClick={() => setView('leaderboard')}
               className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-text-main font-bold text-lg rounded-xl transition border border-border-subtle flex items-center justify-center gap-3 shadow-sm"
            >
              View Leaderboard
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="card-polished p-2 bg-stone-100/50 backdrop-blur-sm -rotate-2 relative z-10">
            <img 
              src="https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=1200&q=80" 
              className="rounded-lg shadow-2xl" 
              alt="Namibia" 
            />
          </div>
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-0"></div>
        </motion.div>
      </div>
    </div>
  );

  if (loadingAuth) return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center">
      <Compass className="w-16 h-16 text-amber-500 animate-spin mb-4" />
      <p className="text-stone-500 font-black text-xs uppercase tracking-widest">Waking our Guides...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200">
      <Navigation onNav={setView} currentView={view} />

      <AnimatePresence mode="wait">
        {view === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Landing /></motion.div>}
        {view === 'wizard' && <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Wizard onGenerate={handleGenerate} isLoading={isGenerating} /></motion.div>}
        {view === 'dashboard' && <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Dashboard onViewTrip={(trip) => { setActiveTrip(trip); setView('results'); }} /></motion.div>}
        {view === 'leaderboard' && <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Leaderboard onViewTrip={(trip) => { setActiveTrip(trip); setView('results'); }} /></motion.div>}
        {view === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UserProfile /></motion.div>}
        {view === 'results' && activeTrip && <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ItineraryView trip={activeTrip} onBack={() => setView('leaderboard')} /></motion.div>}
      </AnimatePresence>

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
