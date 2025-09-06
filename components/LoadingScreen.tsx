import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-amber-400 font-display">
      <div className="w-24 h-24 border-4 border-amber-500/50 border-t-amber-400 rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl font-bold mb-2 tracking-wider animate-pulse-slow">{t('loadingAssets')}</h2>
      <p className="text-gray-400 font-sans transition-opacity duration-500 ease-in-out">{message}</p>
    </div>
  );
};
