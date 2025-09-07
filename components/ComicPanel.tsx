import React from 'react';
import type { PanelData } from '../types';
import { useCachedImage } from '../hooks/useCachedImage';

interface ComicPanelProps {
  panel: PanelData;
  isVisible: boolean;
  isTtsEnabled: boolean;
}

// --- Atmospheric Effects Components ---

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const RainEffect: React.FC = React.memo(() => (
  <div className="atmospheric-overlay">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="raindrop"
        style={{
          left: `${random(0, 100)}%`,
          animationDelay: `${random(0, 2)}s`,
          animationDuration: `${random(0.5, 1.2)}s`,
        }}
      />
    ))}
  </div>
));

const DustEffect: React.FC = React.memo(() => (
   <div className="atmospheric-overlay">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="dust-particle"
        style={{
          top: `${random(20, 80)}%`,
          animationDelay: `${random(0, 10)}s`,
          animationDuration: `${random(8, 15)}s`,
        }}
      />
    ))}
  </div>
));

const SparksEffect: React.FC = React.memo(() => (
   <div className="atmospheric-overlay">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="spark"
        style={{
          left: `${random(30, 70)}%`,
          top: `${random(40, 80)}%`,
          animationDelay: `${random(0, 3)}s`,
          '--tx': `${random(-100, 100)}px`,
          '--ty': `${random(-100, 100)}px`,
        } as React.CSSProperties}
      />
    ))}
  </div>
));

const BattleFlashEffect: React.FC = React.memo(() => (
  <div className="atmospheric-overlay">
    <div className="battle-flash" style={{ '--x': '20%', '--y': '30%', animationDelay: '0s' } as React.CSSProperties} />
    <div className="battle-flash" style={{ '--x': '80%', '--y': '60%', animationDelay: '1s' } as React.CSSProperties} />
  </div>
));

const AtmosphericEffects: React.FC<{ soundscape: string }> = ({ soundscape }) => {
    const lowerSoundscape = soundscape.toLowerCase();

    if (lowerSoundscape.includes('rain') || lowerSoundscape.includes('deszcz') || lowerSoundscape.includes('storm') || lowerSoundscape.includes('burza')) {
        return <RainEffect />;
    }
    if (lowerSoundscape.includes('wind') || lowerSoundscape.includes('wiatr') || lowerSoundscape.includes('dust') || lowerSoundscape.includes('pył')) {
        return <DustEffect />;
    }
    if (lowerSoundscape.includes('sparks') || lowerSoundscape.includes('iskry') || lowerSoundscape.includes('welding') || lowerSoundscape.includes('spawania')) {
        return <SparksEffect />;
    }
    if (lowerSoundscape.includes('battle') || lowerSoundscape.includes('bitwa') || lowerSoundscape.includes('explosions') || lowerSoundscape.includes('eksplozje')) {
        return <BattleFlashEffect />;
    }
    return null;
};


export const ComicPanel: React.FC<ComicPanelProps> = ({ panel, isVisible, isTtsEnabled }) => {
  const cachedImageUrl = useCachedImage(panel.imageUrl);
  const transitionClass = isVisible ? 'panel-enter-active' : 'panel-exit-active';

  const lowerSoundscape = panel.soundscape.toLowerCase();
  const hasRumble = lowerSoundscape.includes('engine') || lowerSoundscape.includes('silnik') || lowerSoundscape.includes('rumble') || lowerSoundscape.includes('pomruk');
  const panelAnimationClass = hasRumble ? 'subtle-screen-shake' : '';

  const wordCount = panel.text.split(' ').length;
  const readingSpeedWps = 2.5; // Words per second (approx. 150 wpm)
  const duration = Math.max(wordCount / readingSpeedWps, 3); // Minimum 3s duration

  const animationStyle = {
    animationDuration: `${duration}s`,
  };

  return (
    <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${transitionClass} ${panelAnimationClass}`}>
      {/* Background Image with Ken Burns Effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center ken-burns"
        style={{ backgroundImage: `url(${cachedImageUrl})` }}
        aria-hidden="true"
      ></div>
      
      {/* Atmospheric Effects Overlay */}
      <AtmosphericEffects soundscape={panel.soundscape} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      
      {/* Content Container */}
      <div className="relative w-full h-full flex flex-col justify-end items-center pb-24 md:pb-32 px-4">
        {/* Main Text Box */}
        <div className="w-full max-w-3xl text-container-bg rounded-lg p-4 md:p-6 mb-4 animate-fade-in bg-[#111111]">
          {isTtsEnabled ? (
            <div className="text-scroll-container">
              <p
                key={panel.text} // Re-mount component on text change to restart animation
                className="text-gray-200 text-lg md:text-xl leading-relaxed text-center font-sans scrolling-text"
                style={animationStyle}
              >
                {panel.text}
              </p>
            </div>
          ) : (
             <p className="text-gray-200 text-lg md:text-xl leading-relaxed text-center font-sans max-h-52 overflow-y-auto">
              {panel.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};