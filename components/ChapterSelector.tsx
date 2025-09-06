import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface ChapterSelectorProps {
  totalChapters: number;
  currentChapter: number;
  onSelectChapter: (chapter: number) => void;
  onUserInteraction: () => void;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = ({ totalChapters, currentChapter, onSelectChapter, onUserInteraction }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const chapterNumbers = Array.from({ length: totalChapters }, (_, i) => i + 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  if (totalChapters === 0) {
    return null; // Don't render if there's no data yet
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          onUserInteraction();
        }}
        className="px-4 py-2 font-display text-base tracking-wider text-amber-400 border-2 border-amber-400/50 rounded-md transition-colors duration-300 hover:bg-amber-400/20 flex items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {t('chapterLabel')} {currentChapter}
        <svg className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 max-h-60 overflow-y-auto right-0 bg-black/80 backdrop-blur-md border border-amber-400/50 rounded-md shadow-lg z-20 animate-fade-in" style={{ animationDuration: '300ms' }}>
          <ul role="menu">
            {chapterNumbers.map(chapter => (
              <li key={chapter}>
                <button
                  onClick={() => {
                    onSelectChapter(chapter);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-amber-400 hover:bg-amber-400/20 font-display tracking-wider"
                  role="menuitem"
                >
                  {t('chapterLabel')} {chapter}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};