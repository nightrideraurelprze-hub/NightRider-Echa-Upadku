import React, { useRef, useEffect } from 'react';

interface NarrationPlayerProps {
  blob: Blob | null;
  isPlaying: boolean;
}

export const NarrationPlayer: React.FC<NarrationPlayerProps> = ({ blob, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Clean up previous object URL if it exists
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (blob && isPlaying) {
      // Create a new URL for the new blob
      objectUrlRef.current = URL.createObjectURL(blob);
      audio.src = objectUrlRef.current;
      audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Audio play failed:", e));
      }
    } else {
      // If not playing or no blob, ensure player is stopped and reset.
      if (!audio.paused) {
        audio.pause();
      }
      audio.removeAttribute('src');
      audio.load();
    }
    
    // Cleanup function to run when the component unmounts or dependencies change
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [blob, isPlaying]);

  return <audio ref={audioRef} />;
};