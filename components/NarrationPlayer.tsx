import React, { useRef, useEffect } from 'react';

interface NarrationPlayerProps {
  src: string | null;
  isPlaying: boolean;
}

export const NarrationPlayer: React.FC<NarrationPlayerProps> = ({ src, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSrcRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If src is null/undefined, fully reset the player state
    if (!src) {
        if (!audio.paused) {
            audio.pause();
        }
        if (audio.src) {
            audio.src = '';
            audio.removeAttribute('src');
            audio.load();
        }
        prevSrcRef.current = null;
        return;
    }

    if (isPlaying) {
        if (src !== prevSrcRef.current) {
            audio.src = src;
            audio.load(); // Load the new source
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.error("Narration playback failed:", e));
            }
        } else if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.error("Narration playback failed:", e));
            }
        }
    } else {
        if (!audio.paused) {
            audio.pause();
        }
    }
    
    prevSrcRef.current = src;

  }, [src, isPlaying]);

  return <audio ref={audioRef} />;
};