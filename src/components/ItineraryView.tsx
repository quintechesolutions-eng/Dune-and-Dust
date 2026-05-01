import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Navigation as NavIcon, Info, Home, ExternalLink, 
  Compass, CheckCircle2, Coffee, Utensils, Moon, DollarSign,
  Heart, Share2, ArrowLeft, Fuel, Backpack, Map as MapIcon, PieChart as PieChartIcon,
  Edit3, Save, X, Calendar, MapPin, Clock, Camera, Download, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedItinerary } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, runTransaction, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SocialShare } from './SocialShare';
import { exportToPDF } from '../services/pdfExport';
import { modifyItinerary } from '../services/ai';
import { ExpeditionMap } from './ExpeditionMap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getTripImage } from '../constants';

interface ItineraryViewProps {
  trip: SavedItinerary;
  onBack: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onBack }) => {
  const [user] = useAuthState(auth);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(trip.likes || 0);
  const [showShare, setShowShare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);

  const isOwner = user?.uid === trip.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(trip.title);
  const [editedOverview, setEditedOverview] = useState(trip.overview);
  const [editedDailyPlan, setEditedDailyPlan] = useState(trip.data.dailyPlan);

  const baseCurrency = (trip as any).baseCurrency || trip.config?.baseCurrency || 'USD';
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
  const symbol = currencySymbols[baseCurrency] || `${baseCurrency} `;

  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const formatCurrency = (val: number | undefined) => {
    if (!val) return "0";
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save edits", e);
    }
  };

  const handleAiModify = async () => {
    if (!aiInstruction.trim() || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const updatedData = await modifyItinerary(trip.data, aiInstruction, trip.config as any);
      await updateDoc(doc(db, 'itineraries', trip.id), {
        data: updatedData,
        title: updatedData.tripSummary.headline,
        overview: updatedData.tripSummary.overview
      });
      setEditedTitle(updatedData.tripSummary.headline);
      setEditedOverview(updatedData.tripSummary.overview);
      setEditedDailyPlan(updatedData.dailyPlan);
      setAiInstruction('');
      setShowAiAssistant(false);
    } catch (e) {
      console.error("AI modification failed", e);
    } finally {
      setIsAiProcessing(false);
    }
  };

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

  const handleDeleteTrip = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'itineraries', trip.id));
      onBack();
    } catch (error) {
      console.error("Error deleting trip:", error);
      setIsDeleting(false);
    }
  };

  const shareUrl = `${window.location.origin}/?trip=${trip.id}`;

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-10" />
        <div className="scrolling-landscapes" />
      </div>

      {/* Global Header */}
      <header className="relative z-50 h-24 glass-panel border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">{trip.title}</h1>
              <div className="px-3 py-1 bg-primary/20 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                ARCHIVED EXPEDITION
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">CURATED BY {trip.userName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToPDF(trip)}
            className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5"
          >
            <Download className="w-4 h-4" /> Export Briefing
          </button>
          <div className="h-10 w-px bg-white/10 mx-2" />
          <button 
            onClick={toggleLike}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${hasLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} /> {localLikes}
          </button>
          <button 
            onClick={() => setShowShare(true)}
            className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {isOwner && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all border border-red-500/20"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Mission Control */}
      <main className="relative z-10 flex-1 flex overflow-hidden">
        
        {/* Left Column: Itinerary Feed */}
        <section className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
          <div className="p-8 md:p-12 shrink-0 bg-gradient-to-b from-slate-900/50 to-transparent">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">DAILY MANIFEST</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trip.data.dailyPlan.length} DAYS</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Navigation className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">~{trip.data.tripSummary.totalEstimatedDistanceKm} KM TOTAL</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar mask-fade-b pb-32">
            <div className="max-w-3xl mx-auto space-y-16 relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary via-slate-700 to-transparent opacity-20" />

              {trip.data.dailyPlan.map((day, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative pl-16 group transition-all ${activeDay === day.day ? 'scale-105' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  onMouseEnter={() => setActiveDay(day.day)}
                >
                  {/* Day Indicator */}
                  <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${activeDay === day.day ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-slate-800 border-white/10 text-slate-500'}`}>
                    <span className="text-[8px] font-black uppercase">DAY</span>
                    <span className="text-xl font-black tracking-tight leading-none">{day.day}</span>
                  </div>

                  <div className="saas-card bg-slate-800/40 border border-white/5 overflow-hidden group/card hover:bg-slate-800/60 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-12">
                      {/* Photo Column */}
                      <div className="md:col-span-4 h-48 md:h-auto relative overflow-hidden">
                        <img 
                          src={getTripImage('', day.location, day.day)} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" 
                          alt={day.location} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">TARGET ZONE</p>
                          <p className="text-lg font-black text-white tracking-tight leading-tight drop-shadow-md">{day.location}</p>
                        </div>
                      </div>

                      {/* Info Column */}
                      <div className="md:col-span-8 p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                          <p className="text-slate-300 font-medium leading-relaxed line-clamp-3">{day.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {day.activities.slice(0, 3).map((act, i) => (
                              <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <Home className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Accommodation</p>
                              <p className="text-xs font-black text-slate-200 tracking-tight leading-none truncate max-w-[120px]">{day.accommodation.name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Car className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Drivetime</p>
                              <p className="text-xs font-black text-slate-200 tracking-tight leading-none">{day.driveTimeHours} HRS</p>
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
        </section>

        {/* Right Column: Strategic View */}
        <aside className="w-[450px] shrink-0 bg-slate-900/50 flex flex-col overflow-hidden">
          {/* Tactical Map */}
          <div className="h-1/2 p-8 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">TACTICAL OVERLAY</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> LIVE TELEMETRY
              </div>
            </div>
            <div className="flex-1 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl relative group/map">
              <ExpeditionMap data={trip.data} />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
                <div className="glass-panel px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                  LAT {trip.data.dailyPlan[activeDay-1]?.coordinates?.lat.toFixed(4) || '0.00'}
                </div>
                <div className="glass-panel px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                  LNG {trip.data.dailyPlan[activeDay-1]?.coordinates?.lng.toFixed(4) || '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Expedition Intel */}
          <div className="h-1/2 p-8 pt-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="saas-card bg-slate-800/40 p-6 border border-white/5">
                  <PieChartIcon className="w-5 h-5 text-primary mb-3" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mission Budget</p>
                  <p className="text-2xl font-black text-white tracking-tight">{symbol}{formatCurrency(trip.data.logistics.estimatedBudgetTotal)}</p>
                </div>
                <div className="saas-card bg-slate-800/40 p-6 border border-white/5">
                  <Backpack className="w-5 h-5 text-emerald-500 mb-3" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gear Count</p>
                  <p className="text-2xl font-black text-white tracking-tight">{trip.data.logistics.packingList.length} ITEMS</p>
                </div>
              </div>

              {/* Climate Intel */}
              <div className="saas-card bg-white/5 p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Compass className="w-24 h-24" />
                </div>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">EXPEDITION CONDITIONS</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Climate Profile</p>
                    <p className="text-sm font-bold text-slate-200 leading-snug">{trip.data.tripSummary.climateExpectancy}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Wildlife Density</p>
                    <p className="text-sm font-bold text-slate-200 leading-snug">{trip.data.tripSummary.wildlifeExpectancy}</p>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="saas-card bg-slate-800/40 p-8 border border-white/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">BUDGET ALLOCATION</h3>
                <div className="space-y-4">
                  {[
                    { name: 'STAY', val: trip.data.logistics.budgetAllocation.accommodation, color: 'bg-primary' },
                    { name: 'FUEL', val: trip.data.logistics.budgetAllocation.transportation, color: 'bg-emerald-500' },
                    { name: 'FOOD', val: trip.data.logistics.budgetAllocation.food, color: 'bg-amber-500' },
                    { name: 'ACTS', val: trip.data.logistics.budgetAllocation.activities, color: 'bg-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-[10px] font-black text-slate-500 tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-200">{symbol}{formatCurrency(item.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Share Modal */}
      <SocialShare 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        title={trip.title} 
        url={shareUrl} 
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full saas-card bg-slate-800 p-10 text-center border border-white/10 shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">PURGE DATA?</h3>
              <p className="text-slate-400 font-medium mb-10">This expedition will be permanently wiped from the archives. This action is irreversible.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteTrip}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                >
                  Confirm Purge
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Abort Deletion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Toggle */}
      <button 
        onClick={() => setShowAiAssistant(!showAiAssistant)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <Compass className={`w-8 h-8 ${isAiProcessing ? 'animate-spin' : ''}`} />
      </button>

      {/* AI Panel */}
      <AnimatePresence>
        {showAiAssistant && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-96 glass-panel p-8 border border-white/10 shadow-2xl z-[60] rounded-[2.5rem]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight uppercase italic">ARCHITECT</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modification Protocol</p>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="ml-auto text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <textarea
              value={aiInstruction}
              onChange={e => setAiInstruction(e.target.value)}
              placeholder="e.g. Add more wildlife photography stops..."
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none min-h-[120px] resize-none mb-4"
            />
            <button
              disabled={isAiProcessing || !aiInstruction.trim()}
              onClick={handleAiModify}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50"
            >
              {isAiProcessing ? 'Re-Architecting...' : 'Execute Modification'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
