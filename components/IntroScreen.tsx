import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface IntroScreenProps {
  onStart: () => void;
}

// Using a known good image from the image DB as a background
const INTRO_BACKGROUND_IMAGE = "https://drive.google.com/uc?export=download&id=1_R82R-5YrmuQ1gY8Z3f3Yq2z_X7yF4jW";

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4 overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center ken-burns"
        style={{ backgroundImage: `url(${INTRO_BACKGROUND_IMAGE})` }}
        aria-hidden="true"
      ></div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black"></div>
      
      {/* Content Container */}
      <div className="relative z-10 animate-fade-in">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-amber-400 tracking-widest mb-4">
          {t('introTitle')}
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 font-sans leading-relaxed mb-8">
          {t('introDescription')}
        </p>
        <button
          onClick={onStart}
          className="px-8 py-3 font-display text-xl tracking-wider text-black bg-amber-400 border-2 border-amber-400 rounded-md transition-all duration-300 hover:bg-amber-500 hover:border-amber-500 transform hover:scale-105"
        >
          {t('startButton')}
        </button>
      </div>

      {/* Copyright Notice */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <p className="text-center text-xs text-gray-500 font-sans">
          © {new Date().getFullYear()} Aureliusz Przednowek. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};