import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChapterSelector } from './ChapterSelector';
import { AudioToggleButton } from './AudioToggleButton';
import { MusicToggleButton } from './MusicToggleButton';

interface HeaderProps {
  totalChapters: number;
  currentChapter: number;
  onSelectChapter: (chapter: number) => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  onUserInteraction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalChapters, 
  currentChapter, 
  onSelectChapter, 
  isTtsEnabled, 
  onToggleTts,
  isMusicEnabled,
  onToggleMusic,
  onUserInteraction
}) => {
  const { t } = useLanguage();
  return (
    <header className="fixed top-0 left-0 w-full bg-black/60 backdrop-blur-lg border-b border-gray-800 z-10 animate-fade-in" onClick={onUserInteraction}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-400 tracking-widest">
          {t('headerTitle')}
        </h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          <ChapterSelector
            totalChapters={totalChapters}
            currentChapter={currentChapter}
            onSelectChapter={onSelectChapter}
            onUserInteraction={onUserInteraction}
          />
          <MusicToggleButton isEnabled={isMusicEnabled} onToggle={onToggleMusic} onUserInteraction={onUserInteraction} />
          {/* FIX: Corrected prop name from isEnabled to isTtsEnabled, which is available in HeaderProps. */}
          <AudioToggleButton isEnabled={isTtsEnabled} onToggle={onToggleTts} onUserInteraction={onUserInteraction} />
          <LanguageSwitcher onUserInteraction={onUserInteraction} />
        </div>
      </div>
    </header>
  );
};