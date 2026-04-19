import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Navigation, Info, Home, ExternalLink, 
  Compass, CheckCircle2, Coffee, Utensils, Moon, DollarSign,
  Heart, Share2, ArrowLeft, Fuel, Backpack 
} from 'lucide-react';
import { motion } from 'motion/react';
import { SavedItinerary } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface ItineraryViewProps {
  trip: SavedItinerary;
  onBack: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onBack }) => {
  const [user] = useAuthState(auth);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(trip.likes || 0);

  useEffect(() => {
    if (user) {
      const checkLike = async () => {
        const likeRef = doc(db, 'itineraries', trip.id, 'likes', user.uid);
        const likeSnap = await getDoc(likeRef);
        setHasLiked(likeSnap.exists());
      };
      checkLike();
    }
  }, [user, trip.id]);

  const toggleLike = async () => {
    if (!user) return alert("Please sign in to upvote journeys!");
    
    try {
      await runTransaction(db, async (transaction) => {
        const likeRef = doc(db, 'itineraries', trip.id, 'likes', user.uid);
        const tripRef = doc(db, 'itineraries', trip.id);
        
        const likeSnap = await transaction.get(likeRef);
        const tripSnap = await transaction.get(tripRef);
        
        if (!tripSnap.exists()) return;
        
        const currentLikes = tripSnap.data().likes || 0;
        
        if (likeSnap.exists()) {
          transaction.delete(likeRef);
          transaction.update(tripRef, { likes: Math.max(0, currentLikes - 1) });
          setLocalLikes(Math.max(0, currentLikes - 1));
          setHasLiked(false);
        } else {
          transaction.set(likeRef, { likedAt: new Date().toISOString() });
          transaction.update(tripRef, { likes: currentLikes + 1 });
          setLocalLikes(currentLikes + 1);
          setHasLiked(true);
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24 font-sans">
      <motion.header 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="bg-stone-900 text-white pt-12 pb-48 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 transition-transform duration-[10s] hover:scale-110">
          <img src="https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" alt="Namibia" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900/80 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-16">
            <button onClick={onBack} className="flex items-center gap-2 group text-stone-400 hover:text-white transition font-bold">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Horizon
            </button>
            <div className="flex gap-4">
              <button 
                onClick={toggleLike}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-black transition border-2 ${hasLiked ? 'bg-red-500 border-red-500 text-white shadow-xl' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} /> {localLikes}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl">
             <div className="flex items-center gap-3 mb-6">
               <img src={trip.userPhoto} className="w-10 h-10 rounded-full border-2 border-amber-500" alt={trip.userName} />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Architected by</p>
                  <p className="font-bold text-white leading-none">{trip.userName}</p>
               </div>
             </div>
             <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tighter">{trip.title}</h1>
             <p className="text-xl md:text-2xl text-stone-300 font-medium leading-relaxed max-w-2xl opacity-80">{trip.overview}</p>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 z-20">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {[ 
             { icon: Users, label: "Travelers", val: `${trip.data.dailyPlan[0]?.location ? 'Optimized' : 'N/A'}` }, 
             { icon: Car, label: "Vehicle", val: `${trip.data.logistics.fuelAdvice.split(' ')[0]} Ready` },
             { icon: Navigation, label: "Horizon", val: `~${trip.data.tripSummary.totalEstimatedDistanceKm} km` }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + i * 0.1 }}
               key={i} 
               className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 flex items-center gap-5"
             >
                <div className="p-4 bg-stone-50 rounded-2xl"><stat.icon className="w-8 h-8 text-stone-800" /></div>
                <div>
                   <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="font-black text-stone-900 text-xl">{stat.val}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Itinerary Body */}
        <div className="space-y-16 mt-16">
          {trip.data.dailyPlan.map((day, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={idx} 
              className="bg-white rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col lg:flex-row group"
            >
              <div className="bg-stone-900 text-white lg:w-1/3 p-10 md:p-14 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-6xl font-black text-white/5 select-none">#{day.day}</span>
                </div>
                <div className="relative z-10">
                  <span className="text-amber-500 font-black text-sm uppercase tracking-widest block mb-4 italic">The Destination</span>
                  <h3 className="text-5xl font-black leading-tight mb-8 tracking-tighter group-hover:text-amber-500 transition-colors">{day.location}</h3>
                  <div className="space-y-6 text-stone-400 font-bold text-sm">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><Car className="text-stone-300 w-5 h-5" /> Drive: {day.driveTimeHours}</div>
                    <div className="flex items-start gap-4 p-4"><Fuel className="text-amber-500 w-5 h-5 shrink-0" /> <span>{day.fuelStopRecommendations}</span></div>
                  </div>
                </div>
                
                <div className="mt-16 bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:bg-white/10 transition cursor-default">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3">Sanctuary</p>
                  <p className="font-black text-2xl mb-1 text-white">{day.accommodation.name}</p>
                  <p className="text-stone-400 text-sm mb-6 font-medium italic">{day.accommodation.type}</p>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(day.accommodation.bookingSearchQuery || day.location)}`} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-3 bg-white text-stone-900 py-4 rounded-2xl font-black hover:bg-stone-200 transition text-sm">
                    Verify Sanctuary <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="lg:w-2/3 p-10 md:p-14">
                <p className="text-stone-700 text-xl font-medium leading-relaxed mb-12 italic border-l-4 border-amber-500 pl-8 overflow-hidden">
                  "{day.description}"
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div>
                        <h4 className="font-black text-2xl text-stone-900 mb-6 flex items-center gap-3"><Compass className="text-amber-600" /> The Maneuvers</h4>
                        <ul className="space-y-5">
                          {day.activities.map((act, i) => (
                            <li key={i} className="flex gap-4 items-start font-bold text-stone-600">
                               <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                               <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                   </div>

                   <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100 flex flex-col justify-between">
                      <div className="space-y-6">
                        <h4 className="font-black text-xl text-stone-900 mb-2 flex items-center gap-3"><Utensils className="text-stone-400" /> Dining Rations</h4>
                        <div className="grid gap-4">
                           <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                              <Coffee className="w-5 h-5 text-stone-400" /> <span className="font-bold text-stone-800 text-sm">{day.meals.breakfast}</span>
                           </div>
                           <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                              <Utensils className="w-5 h-5 text-stone-400" /> <span className="font-bold text-stone-800 text-sm">{day.meals.lunch}</span>
                           </div>
                           <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                              <Moon className="w-5 h-5 text-stone-400" /> <span className="font-bold text-stone-800 text-sm">{day.meals.dinner}</span>
                           </div>
                        </div>
                      </div>
                      {day.meals.dietaryNotes && (
                        <div className="mt-8 pt-6 border-t border-stone-200">
                           <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Ration Advisory</p>
                           <p className="text-xs text-stone-500 italic font-medium">{day.meals.dietaryNotes}</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Logistics */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-4"><Backpack className="text-amber-600 w-8 h-8" /> Expedition Manifest</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                 {trip.data.logistics.packingList.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-600">
                       <div className="w-2 h-2 bg-amber-500 rounded-full" /> {item}
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-stone-900 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign className="w-32 h-32" /></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Expedition Cost estimate</h4>
              <p className="text-7xl font-black tracking-tighter text-white mb-2">${trip.data.logistics.estimatedBudgetTotalUSD?.toLocaleString()}</p>
              <p className="text-stone-500 font-black uppercase text-[10px]">Currency: USD</p>
           </div>
        </div>
      </div>
    </div>
  );
};
