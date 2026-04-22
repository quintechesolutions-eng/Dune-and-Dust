import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Navigation as NavIcon, Info, Home, ExternalLink, 
  Compass, CheckCircle2, Coffee, Utensils, Moon, DollarSign,
  Heart, Share2, ArrowLeft, Fuel, Backpack, Map as MapIcon, PieChart as PieChartIcon,
  Edit3, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedItinerary } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, runTransaction, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SocialShare } from './SocialShare';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ItineraryViewProps {
  trip: SavedItinerary;
  onBack: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onBack }) => {
  const [user] = useAuthState(auth);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(trip.likes || 0);
  const [showShare, setShowShare] = useState(false);

  const isOwner = user?.uid === trip.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(trip.title);
  const [editedOverview, setEditedOverview] = useState(trip.overview);
  const [editedDailyPlan, setEditedDailyPlan] = useState(trip.data.dailyPlan);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'NAD'>('USD');

  const currencyRates = { USD: 1, EUR: 0.94, GBP: 0.81, NAD: 19.3 };
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
  
  const formatCurrency = (usdValue: number | undefined) => {
    if (!usdValue) return "0";
    return (usdValue * currencyRates[currency]).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  useEffect(() => {
    setEditedTitle(trip.title);
    setEditedOverview(trip.overview);
    setEditedDailyPlan(trip.data.dailyPlan);
  }, [trip]);

  const handleSaveEdits = async () => {
    if (!isOwner) return;
    try {
      await updateDoc(doc(db, 'itineraries', trip.id), {
        title: editedTitle,
        overview: editedOverview,
        'data.tripSummary.headline': editedTitle,
        'data.tripSummary.overview': editedOverview,
        'data.dailyPlan': editedDailyPlan
      });
      // Mutate local prop to reflect immediately (since we don't have a real-time listener on the active edit)
      trip.title = editedTitle;
      trip.overview = editedOverview;
      trip.data.tripSummary.headline = editedTitle;
      trip.data.tripSummary.overview = editedOverview;
      trip.data.dailyPlan = editedDailyPlan;
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save edits", e);
      alert("Failed to save your edits. Check console for details.");
    }
  };

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

  const shareUrl = `${window.location.origin}/?trip=${trip.id}`;

  const validDays = trip.data.dailyPlan.filter(d => d.latitude && d.longitude);
  
  const routeFeatures: any = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: validDays.map(d => [d.longitude, d.latitude])
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-bg-main pb-24 font-sans">
      <motion.header 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="bg-stone-900 text-white pt-12 pb-48 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 transition-transform duration-[10s] hover:scale-110">
          <img src="https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" alt="Namibia" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/namibialandscape/2000/1000'; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900/80 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-16">
            <button onClick={onBack} className="flex items-center gap-2 group text-stone-400 hover:text-white transition font-bold">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Horizon
            </button>
            <div className="flex gap-4">
              {isOwner && (
                <button 
                  onClick={() => isEditing ? handleSaveEdits() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-black transition border-2 ${isEditing ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl hover:bg-emerald-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                >
                  {isEditing ? <><Save className="w-5 h-5" /> Save Edits</> : <><Edit3 className="w-5 h-5" /> Edit</>}
                </button>
              )}
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-3 bg-red-500 hover:bg-red-600 rounded-full border border-red-500 text-white transition shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={toggleLike}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-black transition border-2 ${hasLiked ? 'bg-red-500 border-red-500 text-white shadow-xl' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} /> {localLikes}
              </button>
              <button 
                onClick={() => setShowShare(true)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl">
             <div className="flex items-center gap-3 mb-6">
                <img 
                  src={trip.userPhoto || undefined} 
                  className="w-10 h-10 rounded-full border-2 border-primary" 
                  alt={trip.userName} 
                  referrerPolicy="no-referrer" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + trip.userName; }}
                />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">Architected by</p>
                   <p className="font-bold text-white leading-none">{trip.userName}</p>
                </div>
             </div>
             {isEditing ? (
               <div className="space-y-4">
                 <input 
                   type="text"
                   value={editedTitle}
                   onChange={e => setEditedTitle(e.target.value)}
                   className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-4xl md:text-5xl font-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                 />
                 <textarea 
                   rows={3}
                   value={editedOverview}
                   onChange={e => setEditedOverview(e.target.value)}
                   className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-xl text-stone-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none custom-scrollbar"
                 />
               </div>
             ) : (
               <>
                 <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tighter">{trip.title}</h1>
                 <p className="text-xl md:text-2xl text-stone-300 font-medium leading-relaxed max-w-2xl opacity-80">{trip.overview}</p>
               </>
             )}
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 z-20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {[ 
             { icon: Users, label: "Pace", val: trip.config?.logistics?.pace?.split(' ')[0] || 'Standard' }, 
             { icon: Car, label: "Budget Tier", val: trip.config?.logistics?.budget?.split(' ')[0] || 'Flexible' },
             { icon: NavIcon, label: "Horizon", val: `~${trip.data.tripSummary.totalEstimatedDistanceKm} km` },
             { icon: Compass, label: "Climate Info", val: trip.data.tripSummary.climateExpectancy ? 'Assessed' : 'Standard' }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + i * 0.1 }}
               key={i} 
               className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-100 flex items-center gap-5"
             >
                <div className="p-4 bg-stone-50 rounded-2xl shrink-0"><stat.icon className="w-6 h-6 text-primary" /></div>
                <div>
                   <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="font-black text-stone-900 text-lg">{stat.val}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {trip.data.tripSummary.wildlifeExpectancy && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl mb-16 flex items-center gap-6"
          >
             <div className="p-4 bg-white/10 rounded-2xl"><Info className="w-8 h-8 text-primary" /></div>
             <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Wildlife Expectancy & Climate</p>
                <p className="font-medium text-stone-300">
                  {trip.data.tripSummary.wildlifeExpectancy} | {trip.data.tripSummary.climateExpectancy}
                </p>
             </div>
          </motion.div>
        )}

        {trip.data.logistics?.budgetAllocation && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div>
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl"><PieChartIcon className="w-5 h-5 text-amber-600" /></div>
                    <div>
                      <h3 className="text-xl font-black text-stone-900">Budget Allocation</h3>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Estimated: {currencySymbols[currency]}{formatCurrency(trip.data.logistics.estimatedBudgetTotalUSD)} {currency}</p>
                    </div>
                 </div>
                 <select 
                   value={currency} 
                   onChange={(e) => setCurrency(e.target.value as 'USD'|'EUR'|'GBP'|'NAD')}
                   className="bg-stone-100 border border-stone-200 text-stone-700 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                 >
                   <option value="USD">USD ($)</option>
                   <option value="EUR">EUR (€)</option>
                   <option value="GBP">GBP (£)</option>
                   <option value="NAD">NAD (N$)</option>
                 </select>
               </div>
               <p className="text-stone-600 text-sm font-medium leading-relaxed mb-6">
                 Based on your preferred travel pace and selected lodging tiers, this is the projected distribution of your funds.
               </p>
               <div className="space-y-3">
                 {[
                   { name: 'Accommodation', val: trip.data.logistics.budgetAllocation.accommodation, color: 'bg-[#2563eb]' },
                   { name: 'Transport & Fuel', val: trip.data.logistics.budgetAllocation.transportation, color: 'bg-[#10b981]' },
                   { name: 'Food & Dining', val: trip.data.logistics.budgetAllocation.food, color: 'bg-[#f59e0b]' },
                   { name: 'Activities & Park Fees', val: trip.data.logistics.budgetAllocation.activities, color: 'bg-[#8b5cf6]' },
                 ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <div className="flex items-center gap-2">
                         <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                         <span className="text-sm font-bold text-stone-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-stone-900">{currencySymbols[currency]}{formatCurrency(item.val)}</span>
                    </div>
                 ))}
               </div>
            </div>
            <div className="h-[300px] min-h-[300px] w-full relative">
               <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                 <PieChart>
                   <Pie
                     data={[
                       { name: 'Accommodation', value: trip.data.logistics.budgetAllocation.accommodation },
                       { name: 'Transportation', value: trip.data.logistics.budgetAllocation.transportation },
                       { name: 'Food', value: trip.data.logistics.budgetAllocation.food },
                       { name: 'Activities', value: trip.data.logistics.budgetAllocation.activities }
                     ]}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     <Cell fill="#2563eb" />
                     <Cell fill="#10b981" />
                     <Cell fill="#f59e0b" />
                     <Cell fill="#8b5cf6" />
                   </Pie>
                   <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Itinerary Body */}
        <div className="mt-16 relative">
          
          {/* Simplified Route Map */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 mb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 flex items-center justify-center rotate-3">
                  <MapIcon className="w-7 h-7 text-white -rotate-3" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-stone-900 tracking-tight">Expedition Route</h2>
                  <p className="text-stone-500 font-medium mt-1 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" /> Interactive 3D trajectory
                  </p>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-200">
                 <NavIcon className="w-4 h-4" /> Click nodes to jump
              </div>
            </div>
            
            <div className="w-full h-[600px] rounded-[2rem] overflow-hidden shadow-inner border-2 border-stone-200/50 bg-[#e4e1db] relative group">
               <Map
                 initialViewState={{
                   longitude: trip.data.dailyPlan.find(d => d.longitude)?.longitude || 17.0658,
                   latitude: trip.data.dailyPlan.find(d => d.latitude)?.latitude || -22.5609,
                   zoom: 5,
                   pitch: 45
                 }}
                 mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                 interactive={true}
                 attributionControl={false}
               >
                  <Source id="routeData" type="geojson" data={routeFeatures}>
                     <Layer 
                       id="routeLayerLineBase" 
                       type="line" 
                       paint={{
                         "line-color": "#ffffff",
                         "line-width": 8,
                         "line-opacity": 0.8
                       }}
                     />
                     <Layer 
                       id="routeLayer" 
                       type="line" 
                       paint={{
                         "line-color": "#2563eb",
                         "line-width": 4,
                         "line-opacity": 0.9,
                         "line-dasharray": [2, 2]
                       }}
                     />
                  </Source>

                  {trip.data.dailyPlan.map(day => day.waypoints?.map((wp, i) => (
                    <Marker 
                      key={`wp-${day.day}-${i}`}
                      longitude={wp.longitude} 
                      latitude={wp.latitude}
                      anchor="bottom"
                    >
                      <div className="flex flex-col items-center group cursor-pointer mt-2 hover:z-30 relative transition-transform hover:scale-110">
                         <div className="bg-white text-stone-900 border border-stone-200 text-xs font-black uppercase px-3 py-1.5 rounded-xl mb-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {wp.name}
                         </div>
                         <div className="w-8 h-8 bg-white rounded-full border-2 border-stone-200 shadow-md flex items-center justify-center">
                            {wp.type === 'fuel' ? <Fuel className="w-4 h-4 text-red-500" /> : 
                             wp.type === 'meal' ? <Utensils className="w-4 h-4 text-orange-500" /> : 
                             <Compass className="w-4 h-4 text-blue-500" />}
                         </div>
                      </div>
                    </Marker>
                  )))}

                  {Object.values(
                    trip.data.dailyPlan.filter(d => d.latitude && d.longitude).reduce((acc: Record<string, any[]>, day) => {
                      const key = `${day.latitude!.toFixed(3)},${day.longitude!.toFixed(3)}`;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(day);
                      return acc;
                    }, {})
                  ).map((group: any[], idx) => {
                    const firstDay = group[0];
                    const daysLabel = group.map(d => d.day).join(', ');
                    const title = group.map(d => d.location).find(l => l) || firstDay.location;

                    return (
                      <Marker 
                        key={`group-${idx}`}
                        longitude={firstDay.longitude!} 
                        latitude={firstDay.latitude!}
                        anchor="bottom"
                        onClick={(e) => {
                           e.originalEvent.stopPropagation();
                           const el = document.getElementById(`day-${firstDay.day}`);
                           if (el) {
                             el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }
                        }}
                      >
                        <div className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-[1.2] relative hover:z-40">
                           <div className="bg-stone-900 text-white text-[12px] font-black uppercase px-3 py-1.5 rounded-xl mb-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 flex gap-2 items-center pointer-events-none">
                              Day {daysLabel}: {title}
                              <ArrowLeft className="w-3 h-3 rotate-[-135deg] text-primary" />
                           </div>
                           <div className="w-10 h-10 bg-primary/20 rounded-full absolute top-[calc(100%-2.5rem)] left-1/2 -translate-x-1/2 animate-ping" />
                           <div className="px-3 min-w-[2rem] h-8 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center text-[12px] font-black text-white relative z-10 transition-colors group-hover:bg-stone-900 group-hover:text-primary">
                              {daysLabel.length > 3 ? `${group[0].day}-${group[group.length-1].day}` : daysLabel}
                           </div>
                        </div>
                      </Marker>
                    );
                  })}
               </Map>
            </div>
          </div>

          <div className="absolute left-[39px] top-8 bottom-8 w-1 bg-stone-100 hidden lg:block" />
          
          <div className="space-y-24">
            {trip.data.dailyPlan.map((day, idx) => (
              <motion.div 
                id={`day-${day.day}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                key={idx} 
                className="relative lg:pl-24 scroll-mt-[100px]"
              >
                {/* Day Marker */}
                <div className="absolute left-0 top-2 w-20 h-20 bg-stone-900 text-white rounded-3xl hidden lg:flex flex-col items-center justify-center border-4 border-white shadow-xl z-10 transition-transform group-hover:scale-110">
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Day</span>
                   <span className="text-3xl font-black">{day.day}</span>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col lg:flex-row group">
                  <div className="bg-stone-900 text-white lg:w-1/3 p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Compass className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-primary font-black text-sm uppercase tracking-widest block mb-4 italic">The Destination</span>
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editedDailyPlan[idx].location}
                          onChange={e => {
                             const newPlan = [...editedDailyPlan];
                             newPlan[idx].location = e.target.value;
                             setEditedDailyPlan(newPlan);
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-3xl font-black text-white mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <h3 className="text-5xl font-black leading-tight mb-8 tracking-tighter group-hover:text-primary transition-colors">{day.location}</h3>
                      )}
                      
                      <div className="space-y-6 text-stone-400 font-bold text-sm">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><Car className="text-stone-300 w-5 h-5" /> Drive: {day.driveTimeHours}</div>
                        {day.roadConditions && <div className="flex items-start gap-4 p-4"><Info className="text-stone-400 w-5 h-5 shrink-0" /> <span className="italic">{day.roadConditions}</span></div>}
                        <div className="flex items-start gap-4 p-4"><Fuel className="text-primary w-5 h-5 shrink-0" /> <span>{day.fuelStopRecommendations}</span></div>
                      </div>
                    </div>
                    
                    <div className="mt-16 bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:bg-white/10 transition cursor-default">
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3">Sanctuary</p>
                      <p className="font-black text-2xl mb-1 text-white">{day.accommodation.name}</p>
                      <p className="text-stone-400 text-sm mb-4 font-medium italic">{day.accommodation.type}</p>
                      
                      {day.accommodation.features && day.accommodation.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                           {day.accommodation.features.map((feat, i) => (
                             <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-[10px] uppercase font-bold text-stone-300">{feat}</span>
                           ))}
                        </div>
                      )}

                      <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(day.accommodation.bookingSearchQuery || `${day.accommodation.name} Namibia`)}`} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-3 bg-white text-stone-900 py-4 rounded-2xl font-black hover:bg-stone-200 transition text-sm">
                        Verify Sanctuary <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="lg:w-2/3 p-10 md:p-14 bg-white">
                    <div className="mb-12">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Daily Narrative</p>
                       {isEditing ? (
                         <textarea 
                           rows={5}
                           value={editedDailyPlan[idx].description}
                           onChange={e => {
                             const newPlan = [...editedDailyPlan];
                             newPlan[idx].description = e.target.value;
                             setEditedDailyPlan(newPlan);
                           }}
                           className="w-full text-stone-700 text-xl font-medium leading-relaxed italic border-l-4 border-primary pl-6 overflow-hidden bg-stone-50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary custom-scrollbar resize-none"
                         />
                       ) : (
                         <p className="text-stone-700 text-2xl font-medium leading-relaxed italic border-l-4 border-primary pl-8 overflow-hidden">
                           "{day.description}"
                         </p>
                       )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <div>
                            <h4 className="font-black text-2xl text-stone-900 mb-6 flex items-center gap-3"><Compass className="text-primary" /> The Maneuvers</h4>
                            <ul className="space-y-5">
                              {day.activities.map((act, i) => (
                                <li key={i} className="flex gap-4 items-start font-bold text-stone-600">
                                   <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </div>
                                   {isEditing ? (
                                      <input 
                                        type="text"
                                        value={editedDailyPlan[idx].activities[i]}
                                        onChange={e => {
                                          const newPlan = [...editedDailyPlan];
                                          newPlan[idx].activities[i] = e.target.value;
                                          setEditedDailyPlan(newPlan);
                                        }}
                                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                      />
                                   ) : (
                                      <span>{act}</span>
                                   )}
                                </li>
                              ))}
                            </ul>
                          </div>
                       </div>

                       <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100 flex flex-col justify-between">
                          <div className="space-y-6">
                            <h4 className="font-black text-xl text-stone-900 mb-2 flex items-center gap-3"><Utensils className="text-stone-400" /> Dining Rations</h4>
                            <div className="grid gap-4">
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.meals.breakfast + ' ' + day.location + ' Namibia')}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-stone-100 transition group/meal cursor-pointer block">
                                  <Coffee className="w-5 h-5 text-stone-400 group-hover/meal:text-primary transition" /> <span className="font-bold text-stone-800 text-sm whitespace-pre-wrap group-hover/meal:text-primary transition">{day.meals.breakfast}</span>
                               </a>
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.meals.lunch + ' ' + day.location + ' Namibia')}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-stone-100 transition group/meal cursor-pointer block">
                                  <Utensils className="w-5 h-5 text-stone-400 group-hover/meal:text-primary transition" /> <span className="font-bold text-stone-800 text-sm whitespace-pre-wrap group-hover/meal:text-primary transition">{day.meals.lunch}</span>
                               </a>
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.meals.dinner + ' ' + day.location + ' Namibia')}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-stone-100 transition group/meal cursor-pointer block">
                                  <Moon className="w-5 h-5 text-stone-400 group-hover/meal:text-primary transition" /> <span className="font-bold text-stone-800 text-sm whitespace-pre-wrap group-hover/meal:text-primary transition">{day.meals.dinner}</span>
                               </a>
                            </div>
                          </div>
                          {day.meals.dietaryNotes && (
                            <div className="mt-8 pt-6 border-t border-stone-200">
                               <p className="text-[10px] font-black text-primary uppercase mb-1">Ration Advisory</p>
                               <p className="text-xs text-stone-500 italic font-medium leading-relaxed">{day.meals.dietaryNotes}</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Logistics */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-4"><Backpack className="text-primary w-8 h-8" /> Items to bring along to improve trip quality</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                 {trip.data.logistics.packingList.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-600">
                       <div className="w-2 h-2 bg-primary rounded-full" /> {item}
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-stone-900 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign className="w-32 h-32" /></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 mb-4">Expedition Cost estimate</h4>
              <p className="text-7xl font-black tracking-tighter text-white mb-2">{currencySymbols[currency]}{formatCurrency(trip.data.logistics.estimatedBudgetTotalUSD)}</p>
              <p className="text-stone-500 font-black uppercase text-[10px]">Currency: {currency}</p>
              
              {trip.data.logistics.transportBookingQuery && (
                <div className="mt-8 pt-8 border-t border-white/10 relative z-10 w-full">
                  <a href={`https://www.rentalcars.com/search-results?searchQuery=${encodeURIComponent(trip.data.logistics.transportBookingQuery)}`} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-3 bg-primary text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-primary/20">
                    Verify Transport <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
           </div>
        </div>
      </div>

      <SocialShare 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        title={trip.title} 
        url={shareUrl} 
      />
    </div>
  );
};
