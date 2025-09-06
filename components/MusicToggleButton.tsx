import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface MusicToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const MusicToggleButton: React.FC<MusicToggleButtonProps> = ({ isEnabled, onToggle }) => {
  const { t } = useLanguage();

  const SvgMusicOn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
  
  const SvgMusicOff = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-4-4m0 4l4-4" />
    </svg>
  );

  const baseClass = "p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50";
  const activeClass = isEnabled ? "text-amber-400 bg-amber-400/20" : "text-gray-400 hover:text-amber-400 hover:bg-amber-400/10";
  
  return (
    <button
      onClick={onToggle}
      className={`${baseClass} ${activeClass}`}
      aria-label={t(isEnabled ? "disableMusic" : "enableMusic")}
      aria-pressed={isEnabled}
    >
      {isEnabled ? <SvgMusicOn /> : <SvgMusicOff />}
    </button>
  );
};