import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="fixed top-0 left-0 w-full bg-black/60 backdrop-blur-lg border-b border-gray-800 z-10 animate-fade-in">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-400 tracking-widest">
          {t('headerTitle')}
        </h1>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
