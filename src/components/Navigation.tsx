import React, { useEffect, useState } from 'react';
import { Compass, Menu, User, LogOut, LayoutDashboard, Trophy, PlusCircle, Users, Palette } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface NavigationProps {
  onNav: (view: string) => void;
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
    <nav className="bg-white border-b border-border-subtle h-16 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNav('home')}>
          <Compass className="w-6 h-6 text-primary" />
          <span className="text-xl font-extrabold text-text-main tracking-tight">Dune & Dust</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNav('dashboard')}
            className={`nav-item-polished ${currentView === 'dashboard' ? 'nav-item-active-polished' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">My Trips</span>
          </button>
          <button
            onClick={() => onNav('leaderboard')}
            className={`nav-item-polished ${currentView === 'leaderboard' ? 'nav-item-active-polished' : ''}`}
          >
            <Trophy className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Leaderboard</span>
          </button>
          <button
            onClick={() => onNav('social')}
            className={`nav-item-polished ${currentView === 'social' ? 'nav-item-active-polished' : ''}`}
          >
            <Users className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Crew</span>
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
