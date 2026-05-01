import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SavedItinerary } from '../types';
import { Calendar, Trash2, Share2, Eye, EyeOff, Compass, Heart, Download, Car, Navigation as NavIcon, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToPDF } from '../services/pdfExport';
import { getTripImage, LANDSCAPE_IMAGES } from '../constants';

interface DashboardProps {
  onViewTrip: (trip: SavedItinerary) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewTrip }) => {
  const [user] = useAuthState(auth);
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'itineraries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedItinerary[];
        setTrips(data);
        setLoading(false);
      }, (error) => {
        console.error("Dashboard listener error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const togglePublic = async (tripId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'itineraries', tripId), {
      isPublic: !currentStatus
    });
  };

  const confirmDelete = async () => {
    if (tripToDelete) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'itineraries', tripToDelete));
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Failed to delete trip. Please check your connection.");
      } finally {
        setIsDeleting(false);
        setTripToDelete(null);
      }
    }
  };

  if (!user) return (
    <div className="max-w-4xl mx-auto py-24 text-center">
      <Compass className="w-16 h-16 text-stone-300 mx-auto mb-6" />
      <h1 className="text-3xl font-black mb-4">Sign in to track your migrations.</h1>
      <p className="text-stone-500 max-w-sm mx-auto">Your saved journeys and explorer stats will appear here.</p>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Compass className="w-12 h-12 text-amber-500 animate-spin mb-4" />
      <p className="text-stone-500 font-bold text-xs uppercase tracking-widest">Scanning Horizons...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 relative">
      {/* Background Landscape Scroll */}
      <div className="absolute top-0 left-0 right-0 h-[600px] -z-10 overflow-hidden rounded-b-[4rem] opacity-20">
        <div className="scrolling-landscapes opacity-30 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/0 via-[#f8fafc]/50 to-[#f8fafc]" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pt-20">
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-stone-900 tracking-tight mb-2">Mission Control</h1>
          <p className="text-stone-500 font-medium text-lg">Your archived expeditions and safari architectures</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-100 flex gap-2">
          <div className="px-4 py-2 bg-stone-50 rounded-xl text-center">
             <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Trips</p>
             <p className="text-xl font-black text-stone-900">{trips.length}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Trips & Countdown Section */}
      {(() => {
        const now = new Date();
        const upcoming = trips
          .filter(t => t.config?.logistics?.startDate && new Date(t.config.logistics.startDate) > now)
          .sort((a, b) => new Date(a.config!.logistics.startDate!).getTime() - new Date(b.config!.logistics.startDate!).getTime());

        if (upcoming.length > 0) {
          return (
            <div className="mb-16">
              <h2 className="text-sm font-black text-stone-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-500" /> Upcoming Migrations
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcoming.map(trip => {
                  const daysLeft = Math.ceil((new Date(trip.config!.logistics.startDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <motion.div 
                      key={trip.id}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 text-white flex flex-col sm:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-24 h-24 bg-white/10 rounded-3xl flex flex-col items-center justify-center shrink-0 border border-white/10 backdrop-blur-md">
                         <span className="text-[10px] font-black uppercase text-amber-400 mb-1">Days To</span>
                         <span className="text-4xl font-black tracking-tighter">{daysLeft}</span>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                         <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{trip.title}</h3>
                         <p className="text-stone-400 font-medium text-sm mb-4">Starting {new Date(trip.config!.logistics.startDate!).toLocaleDateString()}</p>
                         <button 
                           onClick={() => onViewTrip(trip)}
                           className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-white transition"
                         >
                           Open Pre-Trip Dashboard <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="hidden sm:block absolute right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Compass className="w-24 h-24" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;
      })()}

      <h2 className="text-sm font-black text-stone-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <Compass className="w-4 h-4 text-primary" /> Expedition Archives
      </h2>

      {trips.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-stone-200 shadow-inner"
        >
           <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
             <Compass className="w-12 h-12 text-stone-300" />
           </div>
           <h2 className="text-2xl font-black text-stone-900 mb-2">The horizon is empty.</h2>
           <p className="text-stone-400 font-medium max-w-sm mx-auto mb-10">You haven't mapped any trajectories yet. Start your first Namibian expedition to see it archived here.</p>
           <button 
             onClick={() => window.location.href = '/'}
             className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-stone-800 transition shadow-xl shadow-stone-900/20"
           >
             Map New Journey
           </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {trips.map(trip => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={trip.id}
                className="group bg-white rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden flex flex-col relative"
              >
                {/* Card Header Image/Pattern */}
                <div className="h-40 bg-stone-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent z-10" />
                  <img 
                    src={getTripImage(trip.title, trip.data.dailyPlan[0]?.location)} 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                    alt={trip.title}
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                      <Calendar className="w-3 h-3 text-amber-400" /> {trip.createdAt?.toDate ? trip.createdAt.toDate().toLocaleDateString() : new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 backdrop-blur-md rounded-xl text-xs font-black text-rose-500 border border-rose-500/20">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" /> {trip.likes}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 relative">
                  {/* Floating Icon */}
                  <div className="absolute -top-8 right-8 w-16 h-16 bg-white rounded-2xl shadow-xl border border-stone-100 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 z-20">
                    <Compass className="w-8 h-8 text-amber-600" />
                  </div>

                  <h3 className="text-2xl font-black text-stone-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-1 pr-12">{trip.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-8">{trip.overview}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                        <div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-3.5 h-3.5 text-blue-600" /></div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                          <p className="text-sm font-black text-stone-800">{trip.data.dailyPlan.length} Days</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                        <div className="p-2 bg-emerald-100 rounded-lg"><NavIcon className="w-3.5 h-3.5 text-emerald-600" /></div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Distance</p>
                          <p className="text-sm font-black text-stone-800">{trip.data.tripSummary.totalEstimatedDistanceKm}km</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-stone-50/50 backdrop-blur-sm border-t border-stone-100 flex items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePublic(trip.id, trip.isPublic)}
                      className={`p-3 rounded-xl transition shadow-sm ${trip.isPublic ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'}`}
                      title={trip.isPublic ? 'Public' : 'Private'}
                    >
                      {trip.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => exportToPDF(trip)}
                      className="p-3 bg-white text-stone-700 rounded-xl hover:bg-stone-50 transition border border-stone-200 shadow-sm"
                      title="Export to PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setTripToDelete(trip.id)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition border border-rose-100 shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => onViewTrip(trip)}
                    className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-900/30 transition-all active:scale-95 shadow-xl shadow-stone-900/10"
                  >
                    Details <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-stone-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-black text-stone-900 mb-3">Abandon Journey?</h3>
              <p className="text-stone-500 mb-10 leading-relaxed">This action is permanent. All mapped trajectory data and logistics will be purged from the archive.</p>
              
              <div className="flex gap-4">
                <button 
                  disabled={isDeleting}
                  onClick={() => setTripToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Forever"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
