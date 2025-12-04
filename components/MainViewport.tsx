import React from 'react';
import { Globe, Compass, Box, Zap, Lock, ExternalLink, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { GlassPane } from './GlassPane';
import { UserMenu } from './UserMenu';
import { User } from '../types';

interface MainViewportProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentUrl: string;
  isLoading: boolean;
  isError: boolean;
  onFrameLoad: (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onRefresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const MainViewport: React.FC<MainViewportProps> = ({ 
  sidebarOpen, 
  toggleSidebar, 
  currentUrl, 
  isLoading,
  isError,
  onFrameLoad,
  onNavigateBack,
  onNavigateForward,
  onRefresh,
  canGoBack,
  canGoForward,
  iframeRef,
  user,
  onSignIn,
  onSignOut
}) => {

  const isWelcomePage = currentUrl === '/welcome';

  return (
    <main 
      className={`
        flex-1 h-full relative transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform
        flex flex-col
        ${sidebarOpen ? 'md:mr-[400px]' : ''}
      `}
    >
      {/* Top Header / Nav Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between pointer-events-none">
        
        {/* Branding & Navigation Controls */}
        <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold shadow-lg">
              L
            </div>
            <span className="font-semibold text-gray-700 tracking-tight hidden md:block">LetEX</span>
          </div>

          {/* Navigation Pills */}
          {!isWelcomePage && (
            <GlassPane className="flex items-center gap-1 p-1 rounded-full animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
              <button 
                onClick={onNavigateBack}
                disabled={!canGoBack}
                className={`p-3 md:p-2 rounded-full transition-all active:scale-95 ${canGoBack ? 'hover:bg-black/5 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={onNavigateForward}
                disabled={!canGoForward}
                className={`p-3 md:p-2 rounded-full transition-all active:scale-95 ${canGoForward ? 'hover:bg-black/5 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={onRefresh}
                className="p-3 md:p-2 hover:bg-black/5 rounded-full text-gray-700 transition-all active:scale-95"
              >
                <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </GlassPane>
          )}
        </div>

        {/* Right Side: User Menu & Sidebar Toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* User Menu */}
          <UserMenu user={user} onSignIn={onSignIn} onSignOut={onSignOut} />

          {/* Sidebar Toggle */}
          {(!sidebarOpen || window.innerWidth < 768) && (
            <button 
              onClick={toggleSidebar}
              className="p-3 md:p-2 bg-white/60 backdrop-blur-md rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/80 transition-all border border-white/40 shadow-md active:scale-95"
              aria-label="Open Agent"
            >
              <Box size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full h-full pt-20 pb-24 md:pb-24 px-4 md:px-6 relative overflow-hidden">
        
        {isWelcomePage ? (
          /* Welcome State */
          <div className="w-full h-full flex flex-col items-center justify-center text-center gap-8 animate-in fade-in zoom-in duration-500 pb-20">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-purple-200 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                <GlassPane className="relative p-10 md:p-12 rounded-[2rem] flex flex-col items-center gap-6 border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-50 to-white shadow-inner flex items-center justify-center">
                        <Globe size={40} className="text-blue-900/20" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold text-gray-800">Where to next?</h1>
                        <p className="text-gray-500 text-lg font-light">Search the web, generate ideas, or manage your world.</p>
                    </div>
                </GlassPane>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {[
                    { icon: <Compass size={16} />, label: "Plan a trip" },
                    { icon: <Zap size={16} />, label: "Brainstorm" },
                    { icon: <Box size={16} />, label: "Summarize" }
                ].map((item, i) => (
                    <button 
                        key={i}
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/40 border border-white/40 hover:bg-white/70 hover:scale-105 active:scale-95 transition-all text-sm text-gray-600 font-medium shadow-sm"
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
          </div>
        ) : (
          /* Browser View */
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/40 relative bg-white transition-all">
            
            {/* Loading Indicator Bar */}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-1 z-10">
                 <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left" />
              </div>
            )}

            {/* Error Overlay (Glassmorphism Modal) */}
            {isError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm p-4">
                <GlassPane className="max-w-md w-full p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 shadow-2xl border border-white/80">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                    <Lock size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Content Blocked 🚫</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    This website's security policy prevents embedding.
                    <br/>
                    Please use the Agent for summaries.
                  </p>
                  
                  <a 
                    href={currentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium shadow-lg active:scale-95"
                  >
                    Open in New Tab <ExternalLink size={16} />
                  </a>
                </GlassPane>
              </div>
            )}

            {/* The Browser Frame */}
            <iframe 
              ref={iframeRef}
              src={currentUrl}
              className={`w-full h-full bg-white ${isError ? 'opacity-0' : 'opacity-100'}`}
              onLoad={onFrameLoad}
              title="Content View"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </main>
  );
};