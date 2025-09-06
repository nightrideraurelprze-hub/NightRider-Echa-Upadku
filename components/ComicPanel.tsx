import React from 'react';
import type { PanelData } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface ComicPanelProps {
  panel: PanelData;
  isVisible: boolean;
  isTranslating: boolean;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panel, isVisible, isTranslating }) => {
  const { t } = useLanguage();
  const transitionClass = isVisible ? 'panel-enter-active' : 'panel-exit-active';

  return (
    <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${transitionClass}`}>
      {/* Background Image with Ken Burns Effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center ken-burns"
        style={{ backgroundImage: `url(${panel.imageUrl})` }}
        aria-hidden="true"
      ></div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      
      {/* Content Container */}
      <div className="relative w-full h-full flex flex-col justify-end p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto caption-bg rounded-lg p-4 md:p-6 animate-fade-in">
          <p className="text-gray-200 text-lg md:text-xl leading-relaxed text-center font-sans mb-4">
            {panel.text}
          </p>
          <p className="text-amber-400/70 text-sm text-center italic font-sans">
            {panel.soundscape}
          </p>
        </div>
      </div>

      {/* Translation Loading Overlay */}
      {isTranslating && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 transition-opacity duration-300">
           <div className="w-16 h-16 border-4 border-amber-500/50 border-t-amber-400 rounded-full animate-spin mb-4"></div>
           <p className="font-display text-xl text-amber-400 tracking-wider">{t('translatingStory')}</p>
        </div>
      )}
    </div>
  );
};