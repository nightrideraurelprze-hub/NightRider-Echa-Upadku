import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

type Language = 'pl' | 'en';

interface LanguageSwitcherProps {
  onUserInteraction: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onUserInteraction }) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    onUserInteraction();
  };

  const getButtonClass = (lang: Language) => {
    const baseClass = "px-3 py-1 text-sm font-bold font-display tracking-wider transition-colors duration-300";
    if (language === lang) {
      return `${baseClass} bg-amber-400 text-black`;
    }
    return `${baseClass} text-amber-400 hover:bg-amber-400/20`;
  };

  return (
    <div className="flex items-center border border-amber-400/50 rounded-md overflow-hidden">
      <button onClick={() => handleLanguageChange('pl')} className={getButtonClass('pl')}>
        PL
      </button>
      <button onClick={() => handleLanguageChange('en')} className={getButtonClass('en')}>
        EN
      </button>
    </div>
  );
};