import { useState, useEffect } from 'react';
import { getCachedImageResponse } from '../services/cacheService';

export const useCachedImage = (src: string) => {
  const [imageUrl, setImageUrl] = useState<string>(src);

  useEffect(() => {
    let isMounted = true;
    
    if (!src) return;

    getCachedImageResponse(src)
      .then(cachedResponse => {
        if (isMounted && cachedResponse) {
          return cachedResponse.blob();
        }
        return null;
      })
      .then(blob => {
        if (isMounted && blob) {
          setImageUrl(URL.createObjectURL(blob));
        }
      })
      .catch(error => {
        console.warn(`Could not load image from cache: ${src}`, error);
        if (isMounted) {
            setImageUrl(src); // Fallback to network
        }
      });
      
    // Cleanup created object URL
    return () => {
      isMounted = false;
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return imageUrl;
};