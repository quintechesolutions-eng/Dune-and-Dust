import React from 'react';
import { Compass, Menu, User, LogOut, LayoutDashboard, Trophy, PlusCircle } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface NavigationProps {
  onNav: (view: string) => void;
  currentView: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onNav, currentView }) => {
  const [user] = useAuthState(auth);

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
            onClick={() => onNav('wizard')}
            className="btn-primary-polished flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">Create Journey</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full bg-stone-200 cursor-pointer"
                onClick={() => onNav('profile')}
              />
              <button onClick={logout} className="text-text-muted hover:text-text-main transition px-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
