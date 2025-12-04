import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';
import { GlassPane } from './GlassPane';

interface UserMenuProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onSignIn, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <GlassPane className="rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer">
        <button 
          onClick={onSignIn}
          className="px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-2"
        >
          <span>Sign In</span>
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
             <UserIcon size={14} className="text-gray-500"/>
          </div>
        </button>
      </GlassPane>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 border-white/50 shadow-md overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all focus:outline-none active:scale-95"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
           <GlassPane className="rounded-2xl p-1 shadow-xl border border-white/60 bg-white/80">
              <div className="px-4 py-3 border-b border-black/5 mb-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              
              <button 
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
           </GlassPane>
        </div>
      )}
    </div>
  );
};
