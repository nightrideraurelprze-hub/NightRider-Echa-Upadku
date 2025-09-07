import { useState, useEffect } from 'react';
import { getCachedImageResponse } from '../services/cacheService';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches an image with a retry mechanism and exponential backoff.
 * @param url The URL of the image to fetch.
 *-
 * @param maxRetries The maximum number of retry attempts.
 * @param initialDelay The initial delay between retries in milliseconds.
 * @returns A promise that resolves to the fetch Response object.
 */
async function fetchImageWithRetry(url: string, maxRetries = 3, initialDelay = 1000): Promise<Response> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response; // Success
      }
      // Handle non-OK responses (e.g., 404, 500)
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    } catch (error) {
      attempt++;
      if (attempt < maxRetries) {
        console.warn(`Failed to fetch image from ${url}. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        console.error(`Failed to fetch image from ${url} after ${maxRetries} attempts.`, error);
        throw error; // Re-throw the final error
      }
    }
  }
  // This line should be unreachable if maxRetries > 0
  throw new Error(`Failed to fetch image from ${url} after maximum retries.`);
}


export const useCachedImage = (src: string) => {
  const [imageUrl, setImageUrl] = useState<string>(src);

  useEffect(() => {
    let isMounted = true;
    
    if (!src) return;

    // If the src is a data URI, use it directly without fetching.
    if (src.startsWith('data:image')) {
      setImageUrl(src);
      return;
    }

    const loadImage = async () => {
        try {
            const cachedResponse = await getCachedImageResponse(src);
            let blob: Blob | null = null;

            if (cachedResponse) {
                // Image found in cache
                blob = await cachedResponse.blob();
            } else {
                // Image not in cache, fetch from network with retry logic
                const networkResponse = await fetchImageWithRetry(src);
                blob = await networkResponse.blob();
            }
            
            if (isMounted && blob) {
                setImageUrl(URL.createObjectURL(blob));
            }

        } catch (error) {
            console.warn(`Could not load image from cache or network after retries: ${src}`, error);
            if (isMounted) {
                // Fallback to the original URL if all else fails
                setImageUrl(src);
            }
        }
    };

    loadImage();
      
    // Cleanup created object URL
    return () => {
      isMounted = false;
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return imageUrl;
};