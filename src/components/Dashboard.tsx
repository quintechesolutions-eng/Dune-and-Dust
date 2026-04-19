import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SavedItinerary } from '../types';
import { Calendar, Trash2, Share2, Eye, EyeOff, Compass, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onViewTrip: (trip: SavedItinerary) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewTrip }) => {
  const [user] = useAuthState(auth);
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);

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
      });

      return () => unsubscribe();
    }
  }, [user]);

  const togglePublic = async (tripId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'itineraries', tripId), {
      isPublic: !currentStatus
    });
  };

  const deleteTrip = async (tripId: string) => {
    if (window.confirm("Abandon this journey forever?")) {
      await deleteDoc(doc(db, 'itineraries', tripId));
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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Mission Control</h1>
          <p className="text-stone-500 font-medium">Manage your personal safari architectures</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-stone-200">
           <Compass className="w-16 h-16 text-stone-200 mx-auto mb-4" />
           <p className="text-stone-400 font-black">No journeys mapped yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {trips.map(trip => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={trip.id}
                className="group bg-white rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col"
              >
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-500">
                      <Calendar className="w-3 h-3" /> {trip.createdAt?.toDate ? trip.createdAt.toDate().toLocaleDateString() : new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-red-500 font-black text-sm">
                      <Heart className="w-4 h-4 fill-red-500" /> {trip.likes}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-stone-900 mb-3 group-hover:text-amber-600 transition line-clamp-2">{trip.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed mb-6">{trip.overview}</p>
                </div>

                <div className="px-8 py-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePublic(trip.id, trip.isPublic)}
                      className={`p-3 rounded-xl transition ${trip.isPublic ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-400 hover:bg-stone-300'}`}
                      title={trip.isPublic ? 'Public' : 'Private'}
                    >
                      {trip.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => deleteTrip(trip.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => onViewTrip(trip)}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-stone-800 transition shadow-lg"
                  >
                    Details <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
