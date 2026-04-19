import React, { useEffect, useState } from 'react';
import { Trophy, Heart, ExternalLink, Compass } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedItinerary } from '../types';
import { motion } from 'motion/react';

interface LeaderboardProps {
  onViewTrip: (trip: SavedItinerary) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onViewTrip }) => {
  const [topTrips, setTopTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'itineraries'),
      where('isPublic', '==', true),
      orderBy('likes', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedItinerary[];
      setTopTrips(trips);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Compass className="w-12 h-12 text-amber-500 animate-spin mb-4" />
      <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Loading Hall of Fame...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Top Performers</h1>
          <p className="text-text-muted text-sm">Last updated 2m ago</p>
        </div>
        <Trophy className="w-8 h-8 text-gold" />
      </div>

      <div className="card-polished">
        <div className="bg-white">
          {topTrips.map((trip, idx) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={trip.id}
              onClick={() => onViewTrip(trip)}
              className="grid grid-cols-[48px_1fr_80px] items-center px-6 py-4 border-b border-border-subtle last:border-b-0 hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <span className={`text-lg font-extrabold ${idx === 0 ? 'text-gold' : 'text-text-muted'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-3">
                <img src={trip.userPhoto} alt={trip.userName} className="w-8 h-8 rounded-full bg-stone-100" />
                <div>
                  <p className="font-semibold text-text-main truncate max-w-[200px]">{trip.title}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold">{trip.userName}</p>
                </div>
              </div>

              <div className="text-right flex items-center justify-end gap-2">
                <span className="font-bold text-primary">{trip.likes.toLocaleString()}</span>
                <Heart className={`w-4 h-4 ${trip.likes > 0 ? 'fill-red-500 text-red-500' : 'text-stone-300'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
