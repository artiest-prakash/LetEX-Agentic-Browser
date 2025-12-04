import React from 'react';

interface GlassPaneProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassPane: React.FC<GlassPaneProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        backdrop-blur-[20px] 
        bg-white/75 
        border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
        will-change-transform
        ${className}
      `}
    >
      {children}
    </div>
  );
};