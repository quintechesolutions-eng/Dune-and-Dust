import React, { useEffect, useState } from 'react';
import { User, Shield, Car, Map as MapIcon, Save } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfile as UserProfileType } from '../types';
import { motion } from 'motion/react';

export const UserProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<Partial<UserProfileType>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfileType);
        } else {
          setProfile({
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            bio: '',
            vehicle: { make: 'Toyota', model: 'Hilux', drivetrain: '4x4', fuelType: 'Diesel' },
            preferredRegions: [],
            totalTripsPlanned: 0
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      uid: user.uid,
      photoURL: user.photoURL // Keep synced with Google
    }, { merge: true });
    setSaving(false);
  };

  if (!user) return (
    <div className="max-w-4xl mx-auto py-24 text-center">
      <h1 className="text-3xl font-black mb-4">Please sign in to access your profile.</h1>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl text-center">
            <img src={user.photoURL || ''} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-500 shadow-lg" alt="Avatar" />
            <h2 className="text-2xl font-black text-stone-900">{profile.displayName}</h2>
            <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">{profile.totalTripsPlanned} Journeys Planned</p>
          </div>

          <button 
            disabled={saving}
            onClick={save}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Configuration</>}
          </button>
        </div>

        {/* Right: Detailed Config */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-stone-900">
              <User className="w-5 h-5 text-amber-600" />
              <h3 className="text-xl font-black">Explorer Bio</h3>
            </div>
            <textarea 
              rows={4}
              placeholder="Tell the community about your travel style..."
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500 transition"
              value={profile.bio}
              onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-stone-900">
              <Car className="w-5 h-5 text-amber-600" />
              <h3 className="text-xl font-black">Default Vehicle</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-black uppercase text-stone-400">Make</label>
                 <input 
                  className="w-full p-3 border rounded-xl"
                  value={profile.vehicle?.make}
                  onChange={e => setProfile(prev => ({ ...prev, vehicle: { ...prev.vehicle!, make: e.target.value } }))}
                 />
               </div>
               <div>
                 <label className="text-xs font-black uppercase text-stone-400">Model</label>
                 <input 
                  className="w-full p-3 border rounded-xl"
                  value={profile.vehicle?.model}
                  onChange={e => setProfile(prev => ({ ...prev, vehicle: { ...prev.vehicle!, model: e.target.value } }))}
                 />
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
