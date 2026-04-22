import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Navigation as NavIcon, Info, Home, ExternalLink, 
  Compass, CheckCircle2, Coffee, Utensils, Moon, DollarSign,
  Heart, Share2, ArrowLeft, Fuel, Backpack, Map as MapIcon, PieChart as PieChartIcon,
  Edit3, Save, X, Calendar, MapPin, Clock, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedItinerary } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, runTransaction, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SocialShare } from './SocialShare';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Use the currency that was originally configured, or default to USD
  const baseCurrency = trip.config?.baseCurrency || 'USD';
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
  const symbol = currencySymbols[baseCurrency] || `${baseCurrency} `;

  // No conversion multipliers; AI already returned values in baseCurrency
  const formatCurrency = (val: number | undefined) => {
    if (!val) return "0";
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: validDays.map(d => [d.longitude, d.latitude]) }
    }]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans selection:bg-primary/30">
      {/* Hero Header */}
      <motion.header 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="relative bg-stone-900 text-white pt-8 pb-56 px-6 overflow-hidden rounded-b-[4rem] shadow-2xl"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-[20s] hover:scale-110" 
            alt="Namibia" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-transparent to-transparent opacity-80"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <button onClick={onBack} className="flex items-center gap-2 group text-white/70 hover:text-white transition font-bold bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Dashboard
            </button>
            <div className="flex gap-3">
              {isOwner && (
                <button 
                  onClick={() => isEditing ? handleSaveEdits() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition shadow-lg backdrop-blur-md ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
                >
                  {isEditing ? <><Save className="w-5 h-5" /> Save Edits</> : <><Edit3 className="w-5 h-5" /> Edit Trip</>}
                </button>
              )}
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="p-2.5 bg-red-500/90 hover:bg-red-600 rounded-full text-white transition shadow-lg backdrop-blur-md">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button onClick={toggleLike} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition shadow-lg backdrop-blur-md ${hasLiked ? 'bg-rose-500 text-white' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}>
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} /> {localLikes}
              </button>
              <button onClick={() => setShowShare(true)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition backdrop-blur-md">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl pt-8">
             <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                <img 
                  src={trip.userPhoto || undefined} 
                  className="w-8 h-8 rounded-full border-2 border-primary/50" 
                  alt={trip.userName} 
                  referrerPolicy="no-referrer" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + trip.userName; }}
                />
                <div className="text-sm">
                   <span className="text-white/60 font-medium">Curated by </span>
                   <span className="font-bold text-white">{trip.userName}</span>
                </div>
             </div>

             {isEditing ? (
               <div className="space-y-4">
                 <input 
                   type="text"
                   value={editedTitle}
                   onChange={e => setEditedTitle(e.target.value)}
                   className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-4xl md:text-6xl font-black text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-white/30"
                   placeholder="Trip Title..."
                 />
                 <textarea 
                   rows={4}
                   value={editedOverview}
                   onChange={e => setEditedOverview(e.target.value)}
                   className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-xl text-stone-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none custom-scrollbar"
                   placeholder="A captivating overview of the trip..."
                 />
               </div>
             ) : (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                 <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/70">
                   {trip.title}
                 </h1>
                 <p className="text-xl md:text-2xl text-stone-300 font-medium leading-relaxed max-w-3xl border-l-4 border-primary pl-6 py-2 bg-gradient-to-r from-stone-900/50 to-transparent">
                   {trip.overview}
                 </p>
               </motion.div>
             )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 z-20">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
           {[ 
             { icon: Users, label: "Pace", val: trip.config?.logistics?.pace?.split(' ')[0] || 'Standard', color: 'text-blue-500', bg: 'bg-blue-500/10' }, 
             { icon: Car, label: "Budget Tier", val: trip.config?.logistics?.budget?.split(' ')[0] || 'Flexible', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
             { icon: NavIcon, label: "Total Distance", val: `~${trip.data.tripSummary.totalEstimatedDistanceKm} km`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
             { icon: Compass, label: "Days", val: `${trip.data.dailyPlan.length} Days`, color: 'text-purple-500', bg: 'bg-purple-500/10' }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + i * 0.1 }}
               key={i} 
               className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col md:flex-row items-start md:items-center gap-5 hover:-translate-y-1 transition-transform"
             >
                <div className={`p-4 rounded-2xl shrink-0 ${stat.bg}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                <div>
                   <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{stat.label}</p>
                   <p className="font-black text-stone-900 text-xl tracking-tight">{stat.val}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Climate & Wildlife Info */}
        {(trip.data.tripSummary.wildlifeExpectancy || trip.data.tripSummary.climateExpectancy) && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl mb-12 flex flex-col md:flex-row items-center gap-8 border border-stone-700/50"
          >
             <div className="p-5 bg-white/10 rounded-3xl shrink-0 backdrop-blur-md"><Info className="w-10 h-10 text-primary" /></div>
             <div className="flex-1">
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-3">Expedition Conditions</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {trip.data.tripSummary.wildlifeExpectancy && (
                    <div>
                      <strong className="block text-white/60 mb-1 text-sm">Wildlife Expectancy:</strong>
                      <span className="font-medium text-stone-200 text-lg">{trip.data.tripSummary.wildlifeExpectancy}</span>
                    </div>
                  )}
                  {trip.data.tripSummary.climateExpectancy && (
                    <div>
                      <strong className="block text-white/60 mb-1 text-sm">Climate:</strong>
                      <span className="font-medium text-stone-200 text-lg">{trip.data.tripSummary.climateExpectancy}</span>
                    </div>
                  )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Interactive Map */}
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100/80 mb-16 relative overflow-hidden group/map">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover/map:scale-150" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 flex items-center justify-center">
                <MapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tight">Expedition Route</h2>
                <p className="text-stone-500 font-medium mt-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" /> Interactive 3D Trajectory
                </p>
              </div>
            </div>
            <div className="bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 border border-amber-200/60 shadow-sm">
               <NavIcon className="w-4 h-4" /> Click nodes to jump
            </div>
          </div>
          
          <div className="w-full h-[500px] md:h-[650px] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.2)] border-4 border-stone-800 bg-[#0d1117] relative">
             <Map
               initialViewState={{
                 longitude: trip.data.dailyPlan.find(d => d.longitude)?.longitude || 17.0658,
                 latitude: trip.data.dailyPlan.find(d => d.latitude)?.latitude || -22.5609,
                 zoom: 5.5,
                 pitch: 60,
                 bearing: 20
               }}
               mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
               interactive={true}
               attributionControl={false}
             >
                <Source id="routeData" type="geojson" data={routeFeatures}>
                   {/* Outer Glow */}
                   <Layer 
                     id="routeLayerGlow" 
                     type="line" 
                     paint={{ "line-color": "#f59e0b", "line-width": 14, "line-opacity": 0.2, "line-blur": 10 }}
                   />
                   {/* Inner Solid Line */}
                   <Layer 
                     id="routeLayerLineBase" 
                     type="line" 
                     paint={{ "line-color": "#fbbf24", "line-width": 6, "line-opacity": 0.9 }}
                   />
                   {/* Dashed Overlay */}
                   <Layer 
                     id="routeLayer" 
                     type="line" 
                     paint={{ "line-color": "#ffffff", "line-width": 3, "line-opacity": 1, "line-dasharray": [2, 3] }}
                   />
                </Source>

                {trip.data.dailyPlan.map(day => day.waypoints?.map((wp, i) => (
                  <Marker key={`wp-${day.day}-${i}`} longitude={wp.longitude} latitude={wp.latitude} anchor="bottom">
                    <div className="flex flex-col items-center group cursor-pointer hover:z-30 relative transition-transform hover:scale-125">
                       <div className="bg-stone-900 text-amber-400 border border-amber-500/30 text-xs font-black px-4 py-2 rounded-xl mb-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {wp.name}
                       </div>
                       <div className={`w-10 h-10 rounded-full border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center ${
                         wp.type === 'fuel' ? 'bg-red-500/20 border-red-500 backdrop-blur-md animate-pulse' : 
                         wp.type === 'meal' ? 'bg-orange-500/20 border-orange-500 backdrop-blur-md' : 
                         'bg-blue-500/20 border-blue-500 backdrop-blur-md'
                       }`}>
                          {wp.type === 'fuel' ? <Fuel className="w-5 h-5 text-red-500 drop-shadow-md" /> : 
                           wp.type === 'meal' ? <Utensils className="w-5 h-5 text-orange-500 drop-shadow-md" /> : 
                           <Compass className="w-5 h-5 text-blue-500 drop-shadow-md" />}
                       </div>
                       {wp.type === 'fuel' && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 w-14 h-14 bg-red-500 rounded-full opacity-20 animate-ping pointer-events-none"></div>
                       )}
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
                         document.getElementById(`day-${firstDay.day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <div className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-[1.15] relative hover:z-40 mt-4">
                         <div className="bg-stone-900 text-amber-400 border border-amber-500/30 text-[12px] font-black uppercase px-4 py-2 rounded-2xl mb-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 flex gap-2 items-center pointer-events-none">
                            Day {daysLabel}: {title}
                         </div>
                         <div className="w-14 h-14 bg-amber-500/20 rounded-full absolute top-[calc(100%-3rem)] left-1/2 -translate-x-1/2 animate-ping" />
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[4px] shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 relative z-10 ${
                          activeDay === firstDay.day 
                            ? 'bg-amber-500 border-white scale-110 shadow-[0_0_30px_rgba(245,158,11,0.6)] text-white' 
                            : 'bg-stone-900/80 border-stone-500 group-hover:border-amber-400 group-hover:bg-stone-800 text-stone-300 group-hover:text-amber-400'
                        }`}>
                            <span className="text-lg font-black tracking-tighter">
                              {daysLabel.length > 3 ? `${group[0].day}-${group[group.length-1].day}` : daysLabel}
                            </span>
                         </div>
                      </div>
                    </Marker>
                  );
                })}
             </Map>
          </div>
        </div>

        {/* Daily Itinerary Section */}
        <div className="mt-20 relative">
          <div className="absolute left-[47px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-stone-200 via-stone-300 to-stone-100 hidden lg:block" />
          
          <div className="space-y-20">
            {trip.data.dailyPlan.map((day, idx) => (
              <motion.div 
                id={`day-${day.day}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                key={idx} 
                className="relative lg:pl-28 scroll-mt-[120px]"
              >
                {/* Timeline Day Marker */}
                <div className="absolute left-0 top-6 w-24 h-24 bg-white text-stone-900 rounded-[2rem] hidden lg:flex flex-col items-center justify-center border border-stone-200 shadow-xl z-10 transition-transform group-hover:-translate-y-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Day</span>
                   <span className="text-4xl font-black tracking-tighter">{day.day}</span>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden flex flex-col xl:flex-row group transition-all hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)]">
                  
                  {/* Left Column - Location & Logistics */}
                  <div className="bg-stone-50 xl:w-[35%] p-8 md:p-12 flex flex-col relative overflow-hidden border-r border-stone-100">
                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-primary font-black text-xs uppercase tracking-widest">Destination</span>
                      </div>
                      
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editedDailyPlan[idx].location}
                          onChange={e => {
                             const newPlan = [...editedDailyPlan];
                             newPlan[idx].location = e.target.value;
                             setEditedDailyPlan(newPlan);
                          }}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-3xl font-black text-stone-900 mb-6 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      ) : (
                        <h3 className="text-4xl md:text-5xl font-black leading-[1.1] mb-8 tracking-tighter text-stone-900">{day.location}</h3>
                      )}
                      
                      <div className="space-y-4 mb-10">
                        {day.driveTimeHours && (
                           <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                             <Car className="text-blue-500 w-5 h-5 mt-0.5" /> 
                             <div>
                               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Drive Time</p>
                               <p className="text-stone-800 font-semibold">{day.driveTimeHours.toString().toLowerCase().includes('hour') || day.driveTimeHours.toString().toLowerCase().includes('km') ? day.driveTimeHours : `${day.driveTimeHours} hours`}</p>
                             </div>
                           </div>
                        )}
                        {day.roadConditions && (
                          <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                            <Info className="text-stone-400 w-5 h-5 shrink-0 mt-0.5" /> 
                            <div>
                               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Road Conditions</p>
                               <p className="text-stone-700 font-medium leading-snug">{day.roadConditions}</p>
                            </div>
                          </div>
                        )}
                        {day.fuelStopRecommendations && day.fuelStopRecommendations !== "None needed" && (
                          <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                            <Fuel className="text-red-500 w-5 h-5 shrink-0 mt-0.5" /> 
                            <div>
                               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Fuel Advisory</p>
                               <p className="text-stone-700 font-medium leading-snug">{day.fuelStopRecommendations}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Accommodation Card */}
                    <div className="bg-stone-900 text-white rounded-[2rem] p-8 shadow-xl mt-auto relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="w-5 h-5 text-primary" />
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Accommodation</p>
                      </div>
                      <p className="font-black text-2xl mb-1 text-white leading-tight">{day.accommodation.name}</p>
                      <p className="text-stone-400 text-sm mb-5 font-medium">{day.accommodation.type}</p>
                      
                      {day.accommodation.features && day.accommodation.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                           {day.accommodation.features.slice(0, 4).map((feat, i) => (
                             <span key={i} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] uppercase font-bold text-stone-200 tracking-wider backdrop-blur-sm border border-white/5">{feat}</span>
                           ))}
                        </div>
                      )}

                      <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(day.accommodation.bookingSearchQuery || `${day.accommodation.name} Namibia`)}`} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-3 bg-white text-stone-900 py-3.5 rounded-xl font-bold hover:bg-stone-200 transition text-sm">
                        Check Availability <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column - Details & Meals */}
                  <div className="xl:w-[65%] p-8 md:p-12 bg-white flex flex-col">
                    <div className="mb-12">
                       <div className="flex items-center gap-3 mb-5">
                          <Camera className="w-5 h-5 text-primary" />
                          <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Daily Narrative</p>
                       </div>
                       {isEditing ? (
                         <textarea 
                           rows={6}
                           value={editedDailyPlan[idx].description}
                           onChange={e => {
                             const newPlan = [...editedDailyPlan];
                             newPlan[idx].description = e.target.value;
                             setEditedDailyPlan(newPlan);
                           }}
                           className="w-full text-stone-700 text-lg font-medium leading-relaxed bg-stone-50 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary custom-scrollbar resize-none border border-stone-200"
                         />
                       ) : (
                         <p className="text-stone-700 text-lg md:text-xl font-medium leading-relaxed bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
                           {day.description}
                         </p>
                       )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-auto">
                       {/* Activities */}
                       <div className="bg-stone-50 rounded-[2rem] p-8 border border-stone-100">
                          <h4 className="font-black text-xl text-stone-900 mb-6 flex items-center gap-3"><Compass className="text-primary w-6 h-6" /> Planned Activities</h4>
                          <ul className="space-y-4">
                            {day.activities.map((act, i) => (
                              <li key={i} className="flex gap-4 items-start font-medium text-stone-700">
                                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
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
                                      className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                    />
                                 ) : (
                                    <span className="leading-snug">{act}</span>
                                 )}
                              </li>
                            ))}
                          </ul>
                       </div>

                       {/* Culinary Experience */}
                       <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex flex-col justify-between">
                          <div>
                            <h4 className="font-black text-xl text-stone-900 mb-6 flex items-center gap-3"><Utensils className="text-orange-500 w-6 h-6" /> Culinary Experience</h4>
                            <div className="space-y-5">
                               <div className="flex items-start gap-4">
                                  <div className="p-2.5 bg-white rounded-xl shadow-sm"><Coffee className="w-5 h-5 text-orange-400" /></div>
                                  <div>
                                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Breakfast</p>
                                     <p className="font-semibold text-stone-800 leading-snug">{day.meals.breakfast}</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4">
                                  <div className="p-2.5 bg-white rounded-xl shadow-sm"><Utensils className="w-5 h-5 text-orange-500" /></div>
                                  <div>
                                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Lunch</p>
                                     <p className="font-semibold text-stone-800 leading-snug">{day.meals.lunch}</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4">
                                  <div className="p-2.5 bg-white rounded-xl shadow-sm"><Moon className="w-5 h-5 text-indigo-500" /></div>
                                  <div>
                                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Dinner</p>
                                     <p className="font-semibold text-stone-800 leading-snug">{day.meals.dinner}</p>
                                  </div>
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Logistics & Budget */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
           {trip.data.logistics.budgetAllocation && (
             <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-stone-100 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 w-full">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-emerald-100 rounded-2xl"><PieChartIcon className="w-6 h-6 text-emerald-600" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-stone-900">Budget Allocation</h3>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">Based on {baseCurrency}</p>
                      </div>
                   </div>
                   <p className="text-stone-500 font-medium leading-relaxed mb-8">
                     Your funds are projected to be distributed according to your preferences.
                   </p>
                   <div className="space-y-4">
                     {[
                       { name: 'Accommodation', val: trip.data.logistics.budgetAllocation.accommodation, color: 'bg-blue-500' },
                       { name: 'Transport & Fuel', val: trip.data.logistics.budgetAllocation.transportation, color: 'bg-emerald-500' },
                       { name: 'Food & Dining', val: trip.data.logistics.budgetAllocation.food, color: 'bg-amber-500' },
                       { name: 'Activities & Fees', val: trip.data.logistics.budgetAllocation.activities, color: 'bg-purple-500' },
                     ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                             <span className="text-sm font-bold text-stone-700">{item.name}</span>
                          </div>
                          <span className="text-base font-black text-stone-900">{symbol}{formatCurrency(item.val)}</span>
                        </div>
                     ))}
                   </div>
                </div>
                <div className="h-[300px] w-full md:w-[350px] shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={[
                           { name: 'Accommodation', value: trip.data.logistics.budgetAllocation.accommodation },
                           { name: 'Transportation', value: trip.data.logistics.budgetAllocation.transportation },
                           { name: 'Food', value: trip.data.logistics.budgetAllocation.food },
                           { name: 'Activities', value: trip.data.logistics.budgetAllocation.activities }
                         ]}
                         cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none"
                       >
                         <Cell fill="#3b82f6" />
                         <Cell fill="#10b981" />
                         <Cell fill="#f59e0b" />
                         <Cell fill="#8b5cf6" />
                       </Pie>
                       <Tooltip formatter={(value) => `${symbol}${Number(value).toLocaleString()}`} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
           )}

           <div className="bg-stone-900 text-white p-10 md:p-12 rounded-[3rem] shadow-2xl flex flex-col justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign className="w-32 h-32" /></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Total Estimate</h4>
              <div className="flex items-end justify-center gap-2 mb-2">
                 <span className="text-4xl text-primary font-black pb-2">{symbol}</span>
                 <span className="text-6xl md:text-7xl font-black tracking-tighter text-white">{formatCurrency(trip.data.logistics.estimatedBudgetTotal || (trip.data.logistics as any).estimatedBudgetTotalUSD)}</span>
              </div>
              <p className="text-stone-500 font-bold uppercase tracking-widest text-xs mb-10">{baseCurrency}</p>
              
              {trip.data.logistics.transportBookingQuery && (
                <div className="mt-auto relative z-10 w-full pt-8 border-t border-white/10">
                  <a href={`https://www.rentalcars.com/search-results?searchQuery=${encodeURIComponent(trip.data.logistics.transportBookingQuery)}`} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-3 bg-primary text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition shadow-lg shadow-primary/30">
                    Search Vehicle <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
           </div>
        </div>

        {/* Packing List */}
        <div className="mt-12 bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-stone-100 mb-12">
          <h3 className="text-3xl font-black mb-10 flex items-center gap-4"><Backpack className="text-primary w-8 h-8" /> Recommended Gear</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
             {trip.data.logistics.packingList.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-stone-50 p-5 rounded-2xl font-bold text-stone-600 border border-stone-100 shadow-sm hover:shadow-md transition">
                   <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0" /> <span className="leading-tight">{item}</span>
                </div>
             ))}
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
