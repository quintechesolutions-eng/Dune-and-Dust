import React, { useEffect, useState } from 'react';
import { Compass, Menu, User, LogOut, LayoutDashboard, PlusCircle, Users, Palette, Sparkles } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface NavigationProps {
  onNav: (view: string) => void;
  onReset?: () => void;
  currentView: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onNav, currentView }) => {
  const [user] = useAuthState(auth);
  const [theme, setTheme] = useState('standard');

  const themes = ['standard', 'sunset', 'forest', 'ocean', 'desert'];

  const cycleTheme = () => {
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    if (nextTheme === 'standard') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  return (
    <nav className="glass-panel h-16 sticky top-0 z-50 transition-all border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => {
            if (onReset) onReset();
            onNav('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary transition-all duration-300 group-hover:rotate-[360deg]">
            <Compass className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <span className="text-xl font-black text-stone-900 tracking-tighter uppercase italic tracking-[-0.05em]">DUNE & DUST</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNav('dashboard')}
            className={`nav-item-polished relative group ${currentView === 'dashboard' ? 'text-primary' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">My Trips</span>
            {currentView === 'dashboard' && <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#2563EB]" />}
          </button>

          <button
            onClick={() => onNav('social')}
            className={`nav-item-polished relative group ${currentView === 'social' ? 'text-primary' : ''}`}
          >
            <Users className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">Crew</span>
            {currentView === 'social' && <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#2563EB]" />}
          </button>
          
          <button
            onClick={() => onNav('quicktrip')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 relative overflow-hidden group shadow-lg ${
              currentView === 'quicktrip' 
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white scale-105' 
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 hover:shadow-orange-500/20'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <Sparkles className="w-4 h-4 animate-pulse" /> <span className="hidden sm:inline tracking-tight">AI SPARK PLANNER</span>
          </button>

          <button
            onClick={() => onNav('wizard')}
            className="btn-primary-polished flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">Create Journey</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
              <button onClick={cycleTheme} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-primary transition py-1 px-2 rounded-lg hover:bg-stone-100" title="Cycle Theme">
                <Palette className="w-4 h-4" /> <span className="hidden md:inline">{theme}</span>
              </button>
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full bg-stone-200 cursor-pointer object-cover border-2 border-transparent hover:border-primary transition duration-300"
                onClick={() => onNav('profile')}
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`; }}
              />
              <button
                onClick={logout}
                className="text-stone-400 hover:text-stone-900 transition p-1"
                title="Deauthorize"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-4 border-l border-border-subtle">
              <button onClick={cycleTheme} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-primary transition py-1 px-2 rounded-lg hover:bg-stone-100 mr-2" title="Cycle Theme">
                <Palette className="w-4 h-4" /> <span className="hidden md:inline">{theme}</span>
              </button>
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm border border-stone-200"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
