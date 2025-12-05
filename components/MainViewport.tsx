
import React from 'react';
import { Home, ChevronLeft, ChevronRight, RotateCw, ExternalLink, Bot, HelpCircle } from 'lucide-react';
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
  onNavigateHome: () => void;
  onNavigate: (url: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onReaderMode?: () => void;
  onReportIssue?: () => void;
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
  onNavigateHome,
  onNavigate,
  canGoBack,
  canGoForward,
  iframeRef,
  user,
  onSignIn,
  onSignOut,
  onReaderMode,
  onReportIssue
}) => {

  const isWelcomePage = currentUrl === '/welcome';

  const topSites = [
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'Amazon', url: 'https://amazon.com' },
    { name: 'X', url: 'https://x.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'Reddit', url: 'https://reddit.com' },
    { name: 'Wikipedia', url: 'https://wikipedia.org' },
    { name: 'Google', url: 'https://google.com' },
    { name: 'ChatGPT', url: 'https://chat.openai.com' },
  ];

  // Extract domain for display
  const getDomain = (url: string) => {
      try {
          return new URL(url).hostname.replace('www.', '');
      } catch (e) {
          return url;
      }
  };

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
                onClick={onNavigateHome}
                className="p-3 md:p-2 hover:bg-black/5 rounded-full text-gray-700 transition-all active:scale-95"
                title="Home"
              >
                <Home size={18} />
              </button>
              
              <div className="w-px h-4 bg-gray-300 mx-1" />

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
              <div className="flex items-center gap-2">
                <div className="p-0.5 rounded-full bg-purple-100/50">
                  <div className="w-4 h-4 rounded-full bg-purple-500/20" />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full h-full pt-20 pb-24 md:pb-24 px-4 md:px-6 relative overflow-hidden">
        
        {isWelcomePage ? (
          /* Welcome State */
          <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-500 overflow-y-auto no-scrollbar">
            
            {/* 
                Positioning:
                The Input Bar is centered (top: 50%).
                We place icons starting at 60vh to be safely below it on all screen sizes.
            */}
            <div className="mt-[60vh] w-full max-w-4xl px-4 pb-20">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-8 justify-items-center">
                    {topSites.map((site) => (
                        <button
                            key={site.name}
                            onClick={() => onNavigate(site.url)}
                            className="group flex flex-col items-center gap-3 transition-transform hover:-translate-y-1 active:scale-95"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/80 shadow-sm border border-white/50 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-all backdrop-blur-sm">
                                <img 
                                    src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=128`} 
                                    alt={site.name} 
                                    className="w-8 h-8 md:w-10 md:h-10 opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">{site.name}</span>
                        </button>
                    ))}
                </div>
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

            {/* Smart Site Card (Replaces "Error" Screen) */}
            {isError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/50 backdrop-blur-xl p-4">
                <GlassPane className="max-w-md w-full p-8 rounded-[2rem] flex flex-col items-center text-center gap-6 shadow-2xl border border-white/80 animate-in zoom-in-95 duration-300">
                  
                  {/* Site Identity */}
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center p-4">
                        <img 
                             src={`https://www.google.com/s2/favicons?domain=${currentUrl}&sz=128`} 
                             alt="Site Logo" 
                             className="w-12 h-12 object-contain"
                         />
                     </div>
                     <div>
                         <h2 className="text-xl font-bold text-gray-900">{getDomain(currentUrl)} requires external access</h2>
                     </div>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed px-2">
                    For security, this website must be opened in a separate tab.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full mt-2">
                      <a 
                        href={currentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all text-sm font-semibold shadow-lg active:scale-95 w-full group"
                      >
                        Open {getDomain(currentUrl)} <ExternalLink size={16} className="text-gray-400 group-hover:text-white transition-colors"/>
                      </a>

                      {onReaderMode && (
                        <button 
                            onClick={onReaderMode}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-600 border border-purple-100 rounded-2xl hover:bg-purple-50 transition-all text-sm font-semibold shadow-sm active:scale-95 w-full"
                        >
                            <Bot size={18} /> Ask Agent about this site
                        </button>
                      )}
                  </div>
                </GlassPane>
              </div>
            )}

            {/* Manual Fallback Trigger */}
            {!isError && !isLoading && (
              <button 
                onClick={onReportIssue}
                className="absolute bottom-6 right-6 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:scale-110 transition-all border border-white active:scale-95"
                title="Page not loading?"
              >
                <HelpCircle size={20} />
              </button>
            )}

            {/* The Browser Frame */}
            {/* If blocked, we hide the iframe entirely to avoid console errors and ugly boxes */}
            {!isError && (
                <iframe 
                ref={iframeRef}
                src={currentUrl}
                className={`w-full h-full bg-white transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                onLoad={onFrameLoad}
                title="Content View"
                // Sandbox permissions to improve compatibility while maintaining security
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
                // Don't send referrer to allow some sites to load that check for hotlinking
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                />
            )}
          </div>
        )}
      </div>
    </main>
  );
};
