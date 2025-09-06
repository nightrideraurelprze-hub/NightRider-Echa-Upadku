import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface NavigationProps {
  currentIndex: number;
  totalPanels: number;
  onNext: () => void;
  onPrev: () => void;
  onUserInteraction: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentIndex, totalPanels, onNext, onPrev, onUserInteraction }) => {
  const { t } = useLanguage();
  const isAtStart = currentIndex === 0;
  const isAtEnd = totalPanels > 0 && currentIndex === totalPanels - 1;

  return (
    <nav className="relative z-20 w-full p-4 bg-black/50 backdrop-blur-sm border-t border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <button
          onClick={() => { onPrev(); onUserInteraction(); }}
          disabled={isAtStart}
          className="px-6 py-2 font-display text-lg tracking-wider text-amber-400 border-2 border-amber-400 rounded-md transition-all duration-300 hover:bg-amber-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-400"
          aria-label="Previous Panel"
        >
          {t('prevButton')}
        </button>
        <div className="font-display text-gray-300 text-lg">
          {t('panelLabel')} <span className="text-white font-bold">{totalPanels > 0 ? currentIndex + 1 : 0}</span> / <span className="text-white font-bold">{totalPanels}</span>
        </div>
        <button
          onClick={() => { onNext(); onUserInteraction(); }}
          disabled={isAtEnd}
          className="px-6 py-2 font-display text-lg tracking-wider text-amber-400 border-2 border-amber-400 rounded-md transition-all duration-300 hover:bg-amber-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-400"
          aria-label="Next Panel"
        >
          {t('nextButton')}
        </button>
      </div>
    </nav>
  );
};