import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string | null;
  isPlaying: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && src) {
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
      }
      if (audio.paused) {
        audio.play().catch(e => console.error("Background audio play failed:", e));
      }
      audio.volume = 0.5; // Set desired volume
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [src, isPlaying]);

  return <audio ref={audioRef} loop />;
};