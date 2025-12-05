
import React, { useState, useEffect } from 'react';
import { Mic, Paperclip, ArrowUp, Loader2 } from 'lucide-react';
import { GlassPane } from './GlassPane';

interface CommandBarProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  currentUrl: string;
  isSidebarOpen: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSubmit, isLoading, currentUrl, isSidebarOpen }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Track screen size for positioning logic
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentUrl === '/welcome') {
      // Don't clear if user is typing on welcome
    } else {
      setInputValue(currentUrl);
    }
  }, [currentUrl]);

  // Determine Positioning Logic
  // 1. If NOT on Welcome page -> Always Bottom
  // 2. If on Welcome page:
  //    - If Sidebar is Open -> Bottom (Prevent overlap with Agent)
  //    - If Sidebar is Closed -> Center
  const isWelcome = currentUrl === '/welcome';
  const shouldCenter = isWelcome && !isSidebarOpen;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSubmit(inputValue);
      if (inputValue.includes(' ') && !inputValue.startsWith('http')) {
        setInputValue(''); 
        (e.target as HTMLInputElement).blur();
      } else {
         (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleActionClick = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue);
      if (inputValue.includes(' ') && !inputValue.startsWith('http')) {
        setInputValue('');
      }
    }
  };

  return (
    <div 
      className={`
        fixed left-0 right-0 z-50 flex justify-center px-4 md:px-0 pointer-events-none 
        transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${shouldCenter ? 'top-1/2 -translate-y-[140%]' : 'bottom-6'}
      `}
    >
      <GlassPane 
        className={`
          pointer-events-auto
          relative flex items-center p-2 rounded-full transition-all duration-300 ease-out will-change-transform
          ${isFocused || shouldCenter ? 'w-full md:w-[700px] shadow-2xl scale-[1.02]' : 'w-full md:w-[600px] shadow-xl'}
          bg-white/80 backdrop-blur-2xl border-white/60
        `}
      >
        {/* Attachment Button */}
        <button className="p-3 md:p-3 text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-full transition-colors active:scale-95 shrink-0">
          <Paperclip size={22} strokeWidth={2} />
        </button>

        {/* Main Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask LetEX or type a URL..."
          className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 px-3 text-base md:text-lg font-medium h-12"
          autoComplete="off"
        />

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {inputValue ? (
             <button 
               onClick={handleActionClick}
               className="p-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-90 transition-all animate-in fade-in zoom-in duration-200 flex items-center justify-center shadow-lg"
             >
               {isLoading ? (
                 <Loader2 size={22} className="animate-spin" />
               ) : (
                 <ArrowUp size={22} strokeWidth={2.5} />
               )}
             </button>
          ) : (
            <button className="p-3 text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-full transition-colors active:scale-95">
              <Mic size={22} strokeWidth={2} />
            </button>
          )}
        </div>
      </GlassPane>
    </div>
  );
};
