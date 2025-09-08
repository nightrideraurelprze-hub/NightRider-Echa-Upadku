import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string | null;
  isPlaying: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isPlaying }) => {
  const audioRef1 = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const activeAudioRef = useRef<React.RefObject<HTMLAudioElement>>(audioRef1);

  // Use separate refs for fade-in and fade-out to allow simultaneous fades
  const fadeInIntervalRef = useRef<number | null>(null);
  const fadeOutIntervalRef = useRef<number | null>(null);

  const TARGET_VOLUME = 0.5;
  const FADE_DURATION = 1500;

  useEffect(() => {
    const activeAudio = activeAudioRef.current.current;
    const inactiveAudio = (activeAudioRef.current === audioRef1 ? audioRef2 : audioRef1).current;

    if (!activeAudio || !inactiveAudio) return;

    // --- Helper function to manage fading ---
    const fade = (
      audioEl: HTMLAudioElement,
      targetVolume: number,
      intervalRef: React.MutableRefObject<number | null>,
      onComplete?: () => void
    ) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const steps = 50;
      const stepDuration = FADE_DURATION / steps;
      const volumeStep = (targetVolume - audioEl.volume) / steps;
      
      if (Math.abs(audioEl.volume - targetVolume) < 0.01) {
        if(onComplete) onComplete();
        return;
      }
      
      intervalRef.current = window.setInterval(() => {
        const newVolume = audioEl.volume + volumeStep;
        if ((volumeStep > 0 && newVolume >= targetVolume) || (volumeStep < 0 && newVolume <= targetVolume)) {
          audioEl.volume = targetVolume;
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (onComplete) onComplete();
        } else {
          audioEl.volume = newVolume;
        }
      }, stepDuration);
    };
    
    // --- Logic ---

    // 1. Source has changed: need to crossfade
    if (src && activeAudio.src !== src) {
      inactiveAudio.src = src;
      inactiveAudio.volume = 0;

      if (isPlaying) {
        inactiveAudio.play().catch(e => console.error("Audio play failed (crossfade):", e));
        
        fade(inactiveAudio, TARGET_VOLUME, fadeInIntervalRef);
        
        if(!activeAudio.paused) {
          fade(activeAudio, 0, fadeOutIntervalRef, () => {
            activeAudio.pause();
            activeAudio.src = '';
          });
        }
        
        activeAudioRef.current = activeAudioRef.current === audioRef1 ? audioRef2 : audioRef1;
      } else {
        // If paused, silently swap the source on the new active player so it's ready.
        activeAudio.src = '';
        activeAudioRef.current = activeAudioRef.current === audioRef1 ? audioRef2 : audioRef1;
        activeAudioRef.current.current!.src = src;
      }
    } 
    // 2. Handle toggling play/pause state (no src change)
    else {
      if (isPlaying && activeAudio.paused && activeAudio.src) {
        activeAudio.play().catch(e => console.error("Audio play failed (play toggle):", e));
        fade(activeAudio, TARGET_VOLUME, fadeInIntervalRef);
      } else if (!isPlaying && !activeAudio.paused) {
        fade(activeAudio, 0, fadeOutIntervalRef, () => {
            activeAudio.pause();
        });
      }
    }
    
    // Cleanup intervals on component unmount or dependency change
    return () => {
      if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
      if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
    };

  }, [src, isPlaying]);

  return (
    <>
      <audio ref={audioRef1} loop />
      <audio ref={audioRef2} loop />
    </>
  );
};
