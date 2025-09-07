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

    // If we're supposed to be playing and have a blob
    if (isPlaying && blob) {
      // Create a new URL if the blob is new
      if (audio.src.includes('blob:') === false || !objectUrlRef.current) {
         if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }
        objectUrlRef.current = URL.createObjectURL(blob);
        audio.src = objectUrlRef.current;
      }
      
      // Play the audio
      if (audio.paused) {
        audio.play().catch(e => console.error("Narration audio play failed:", e));
      }

    } else {
      // If we're not supposed to be playing, pause the audio
      if (!audio.paused) {
        audio.pause();
      }
    }

    // Cleanup function to revoke URL on unmount
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [blob, isPlaying]);

  return <audio ref={audioRef} />;
};