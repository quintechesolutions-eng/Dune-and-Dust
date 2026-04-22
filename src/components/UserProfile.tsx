import React, { useEffect, useState } from 'react';
import { User, Shield, Car, Save, Trophy, Star, Award, Zap, Camera, Search, Heart, LogOut, Trash2, ChevronRight } from 'lucide-react';
import { db, auth, logout } from '../lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfile as UserProfileType } from '../types';
import { motion } from 'motion/react';

const ACHIEVEMENTS = [
  { id: 'first_trip', label: 'First Migration', icon: Zap, color: 'text-amber-500 bg-amber-50', desc: 'Planned your first Namibian journey.' },
  { id: 'social_star', label: 'Social Star', icon: Heart, color: 'text-red-500 bg-red-50', desc: 'Gathered 10+ likes on a single trip.' },
  { id: 'dune_master', label: 'Dune Master', icon: Trophy, color: 'text-gold bg-amber-50', desc: 'Planned a trip with 20+ days.' },
  { id: 'night_owl', label: 'Astrophotographer', icon: Camera, color: 'text-blue-500 bg-blue-50', desc: 'Included 3+ stargazing locations.' },
];

export const UserProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<Partial<UserProfileType>>({});
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfileType);
        } else {
          setProfile({
            uid: user.uid,
            username: '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            bio: '',
            achievements: ['first_trip'],
            stats: { totalLikes: 0, totalTrips: 0, daysExplored: 0 },
            vehicle: { make: 'Toyota', model: 'Hilux', drivetrain: '4x4', fuelType: 'Diesel' }
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  const checkUsername = async (name: string) => {
    if (name.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const q = query(collection(db, 'usernames'), where('__name__', '==', name.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty && snap.docs[0].data().uid !== user?.uid) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('available');
    }
  };

  const save = async () => {
    if (!user || !profile.username || usernameStatus === 'taken') return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const nameRef = doc(db, 'usernames', profile.username.toLowerCase());
      
      // Atomic username registration (Simplified here, ideally a transaction)
      await setDoc(nameRef, { uid: user.uid });
      await setDoc(userRef, {
        ...profile,
        uid: user.uid,
        photoURL: user.photoURL 
      }, { merge: true });
      
      alert("Explorer profile synchronized!");
    } catch (e) {
      console.error(e);
      alert("Registry collision. Try another handle.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="max-w-4xl mx-auto py-24 text-center">
      <h1 className="text-3xl font-black mb-4">Please sign in to access your profile.</h1>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Basic Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-polished p-8 text-center bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <img 
              src={profile.photoURL || undefined} 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl ring-2 ring-primary/20" 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username; }}
            />
            <h2 className="text-2xl font-bold text-text-main">{profile.displayName}</h2>
            <p className="text-primary font-bold text-sm mb-6">@{profile.username || 'unidentified_explorer'}</p>
            
            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-stone-100">
               <div>
                  <p className="text-lg font-extrabold text-text-main">{profile.stats?.totalTrips || 0}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Trips</p>
               </div>
               <div>
                  <p className="text-lg font-extrabold text-text-main">{profile.stats?.totalLikes || 0}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Likes</p>
               </div>
               <div>
                  <p className="text-lg font-extrabold text-text-main">{profile.stats?.daysExplored || 0}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Days</p>
               </div>
            </div>
          </div>

          <div className="card-polished p-8 bg-white">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-6 uppercase tracking-widest">
               <Trophy className="w-4 h-4 text-gold" /> Achievements
            </h3>
            <div className="space-y-4">
               {ACHIEVEMENTS.map(ach => {
                 const earned = profile.achievements?.includes(ach.id);
                 return (
                   <div key={ach.id} className={`flex items-start gap-3 ${earned ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                      <div className={`p-2 rounded-xl ${ach.color}`}>
                         <ach.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-main">{ach.label}</p>
                        <p className="text-[10px] text-text-muted leading-tight">{ach.desc}</p>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          <button 
            disabled={saving || usernameStatus === 'taken'}
            onClick={save}
            className="w-full btn-primary-polished py-4 text-lg flex items-center justify-center gap-2"
          >
            {saving ? 'Syncing...' : <><Save className="w-5 h-5" /> Update Registry</>}
          </button>
        </div>

        {/* Right: Detailed Config */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="card-polished p-8 bg-white">
            <div className="flex items-center gap-2 mb-8 text-text-main">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Identity Configuration</h3>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Unique Explorer Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">@</span>
                    <input 
                      placeholder="explorer_name"
                      className={`w-full pl-8 pr-4 py-3 bg-stone-50 border rounded-xl font-bold text-text-main focus:ring-2 focus:outline-none ${
                        usernameStatus === 'taken' ? 'border-red-300 focus:ring-red-100' : 
                        usernameStatus === 'available' ? 'border-emerald-300 focus:ring-emerald-100' : 'border-stone-100 focus:ring-blue-100'
                      }`}
                      value={profile.username || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                        setProfile(prev => ({ ...prev, username: val }));
                        checkUsername(val);
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold">
                       {usernameStatus === 'checking' && <span className="text-blue-500">Checking...</span>}
                       {usernameStatus === 'taken' && <span className="text-red-500">Taken</span>}
                       {usernameStatus === 'available' && <span className="text-emerald-500">Available</span>}
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted px-2 italic">Handle must be 3-30 characters, alphanumeric or underscores.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Explorer Bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell the community about your travel style..."
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none transition font-medium"
                    value={profile.bio || ''}
                    onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Base Currency</label>
                  <select 
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-bold text-text-main focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                    value={profile.preferredCurrency || 'USD'}
                    onChange={e => setProfile(prev => ({ ...prev, preferredCurrency: e.target.value }))}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NAD">NAD (N$)</option>
                    <option value="ZAR">ZAR (R)</option>
                  </select>
                </div>
            </div>
          </div>

          <div className="card-polished p-8 bg-white">
            <div className="flex items-center gap-2 mb-6 text-text-main">
              <Car className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Primary Expedition Vehicle</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted">Preferred Vehicle Classification</label>
                <select 
                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold"
                  value={profile.vehicle?.make || ''}
                  onChange={e => setProfile(prev => ({ 
                    ...prev, 
                    vehicle: { ...prev.vehicle!, make: e.target.value } 
                  }))}
                >
                  <option value="Heavy-Duty 4x4 SUV (Expedition Equipped)">Heavy-Duty 4x4 SUV (Expedition Equipped)</option>
                  <option value="Standard 4x4 SUV">Standard 4x4 SUV</option>
                  <option value="Compact 4x4 SUV">Compact 4x4 SUV</option>
                  <option value="Hybrid 4x4 SUV">Hybrid 4x4 SUV</option>
                  <option value="4x4 Expedition Campervan">4x4 Expedition Campervan</option>
                  <option value="Fully Electric Safari Vehicle">Fully Electric Safari Vehicle</option>
                  <option value="Rugged AWD Crossover">Rugged AWD Crossover</option>
                  <option value="Small 2x4 Hatchback">Small 2x4 Hatchback</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6 hidden">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase text-text-muted">Make</label>
                   <input 
                    className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold"
                    value={profile.vehicle?.make || ''}
                    onChange={e => setProfile(prev => ({ ...prev, vehicle: { ...prev.vehicle!, make: e.target.value } }))}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase text-text-muted">Model</label>
                   <input 
                    className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold"
                    value={profile.vehicle?.model || ''}
                    onChange={e => setProfile(prev => ({ ...prev, vehicle: { ...prev.vehicle!, model: e.target.value } }))}
                   />
                 </div>
              </div>
            </div>
          </div>
          <div className="card-polished p-8 bg-white">
            <div className="flex items-center gap-2 mb-6 text-text-main">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Mission Management</h3>
            </div>
            <div className="space-y-4">
               <button 
                 onClick={logout}
                 className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition group"
               >
                 <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-stone-400 group-hover:text-stone-900" />
                    <span className="font-bold text-stone-700">Deauthorize Account</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-stone-300" />
               </button>
               <button 
                 className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition group"
                 onClick={() => alert("Identity deletion requires manual override. Please contact support.")}
               >
                 <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                    <span className="font-bold text-red-600">Erase Presence</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-red-300" />
               </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
