import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string | null;
  isPlaying: boolean;
}

const FADE_DURATION = 1000; // 1 second fade

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const fadeOut = (audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    const step = audio.volume / (FADE_DURATION / 50);
    fadeIntervalRef.current = window.setInterval(() => {
      if (audio.volume > step) {
        audio.volume -= step;
      } else {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.pause();
        audio.volume = 0;
      }
    }, 50);
  };

  const fadeIn = (audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.volume = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
    const step = 0.5 / (FADE_DURATION / 50); // Target volume 0.5
    fadeIntervalRef.current = window.setInterval(() => {
      if (audio.volume < 0.5 - step) {
        audio.volume += step;
      } else {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.volume = 0.5;
      }
    }, 50);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && src) {
      if (audio.src !== src) {
        // If there's a track playing, fade it out first
        if (!audio.paused) {
           fadeOut(audio);
           setTimeout(() => {
              audio.src = src;
              fadeIn(audio);
           }, FADE_DURATION);
        } else {
          audio.src = src;
          fadeIn(audio);
        }
      } else if (audio.paused) {
         fadeIn(audio);
      }
    } else {
      if (!audio.paused) {
        fadeOut(audio);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    }
  }, [src, isPlaying]);

  return <audio ref={audioRef} loop />;
};