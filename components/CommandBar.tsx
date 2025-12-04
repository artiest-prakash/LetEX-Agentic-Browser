import React, { useState, useEffect } from 'react';
import { Mic, Paperclip, ArrowUp, Loader2 } from 'lucide-react';
import { GlassPane } from './GlassPane';

interface CommandBarProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  currentUrl: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSubmit, isLoading, currentUrl }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (currentUrl === '/welcome') {
      // Don't clear if user is typing
    } else {
      setInputValue(currentUrl);
    }
  }, [currentUrl]);

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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:px-0 pointer-events-none">
      <GlassPane 
        className={`
          pointer-events-auto
          relative flex items-center p-2 rounded-full transition-all duration-300 ease-out will-change-transform
          ${isFocused ? 'w-full md:w-[700px] shadow-2xl scale-[1.02]' : 'w-full md:w-[600px] shadow-xl'}
          bg-white/80 backdrop-blur-xl border-white/60
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