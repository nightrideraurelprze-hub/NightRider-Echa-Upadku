import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface AudioToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const AudioToggleButton: React.FC<AudioToggleButtonProps> = ({ isEnabled, onToggle }) => {
  const { t } = useLanguage();
  
  const SvgSpeakerOn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );

  const SvgSpeakerOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-4-4m0 4l4-4" />
    </svg>
  );

  const baseClass = "p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50";
  const activeClass = isEnabled ? "text-amber-400 bg-amber-400/20" : "text-gray-400 hover:text-amber-400 hover:bg-amber-400/10";
  
  return (
    <button
      onClick={onToggle}
      className={`${baseClass} ${activeClass}`}
      aria-label={t(isEnabled ? "disableNarration" : "enableNarration")}
      aria-pressed={isEnabled}
    >
      {isEnabled ? <SvgSpeakerOn /> : <SvgSpeakerOff />}
    </button>
  );
};