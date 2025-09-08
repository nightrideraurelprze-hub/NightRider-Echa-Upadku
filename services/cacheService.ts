import type { PanelData, SavedProgress } from '../types';

const IMAGE_CACHE_NAME = 'nightrider-image-cache-v1';
const AUDIO_CACHE_NAME = 'nightrider-audio-cache-v1.1';

// --- Local Storage Cache for Story Data ---

export const getProgressFromCache = (cacheKey: string): SavedProgress | null => {
    try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log("Loading user progress from localStorage...");
            const progress = JSON.parse(cachedData) as SavedProgress;
            // Add version check for future migrations
            if (progress.version === '1.0') {
                return progress;
            }
        }
    } catch (error) {
        console.error("Failed to load progress from localStorage.", error);
        localStorage.removeItem(cacheKey); // Clear corrupted data
    }
    return null;
};

export const saveProgressToCache = (cacheKey: string, progress: SavedProgress): void => {
    try {
        const dataString = JSON.stringify(progress);
        localStorage.setItem(cacheKey, dataString);
    } catch (error)
        {
        console.error("Failed to save progress to localStorage.", error);
    }
};


// --- Cache API for Images and Audio ---

const getCache = (name: string): Promise<Cache> => {
    return caches.open(name);
};

// --- Image Caching ---
export const getCachedImageResponse = async (url: string): Promise<Response | undefined> => {
    try {
        const cache = await getCache(IMAGE_CACHE_NAME);
        return await cache.match(url);
    } catch (error) {
        console.error("Error getting image from cache:", error);
        return undefined;
    }
};

export const cacheImage = async (url: string): Promise<void> => {
    try {
        const cache = await getCache(IMAGE_CACHE_NAME);
        const existing = await cache.match(url);
        if (!existing) {
            console.log(`Caching image: ${url}`);
            const response = await fetch(url);
            await cache.put(url, response);
        }
    } catch (error) {
        console.error(`Failed to cache image ${url}:`, error);
    }
};


// --- Audio Caching ---
export const getCachedAudioBlob = async (key: string): Promise<Blob | null> => {
    try {
        const cache = await getCache(AUDIO_CACHE_NAME);
        const response = await cache.match(key);
        if (response) {
            return response.blob();
        }
    } catch (error) {
        console.error("Error getting audio from cache:", error);
    }
    return null;
};

export const cacheAudio = async (key: string, audioBlob: Blob): Promise<void> => {
    try {
        const cache = await getCache(AUDIO_CACHE_NAME);
        const response = new Response(audioBlob, { headers: { 'Content-Type': 'audio/mpeg' } });
        await cache.put(key, response);
        console.log(`Audio cached for key: ${key}`);
    } catch (error) {
        console.error(`Failed to cache audio for key ${key}:`, error);
    }
};

/**
 * Fetches an audio file from a URL, caches it, and returns the Blob.
 * If the audio is already in the cache, it returns the cached version.
 * @param key The unique key for caching the audio.
 * @param url The URL of the audio file to fetch.
 * @returns A promise that resolves to an audio Blob, or null on failure.
 */
export const fetchAndCacheAudio = async (key: string, url: string): Promise<Blob | null> => {
    try {
        const cachedBlob = await getCachedAudioBlob(key);
        if (cachedBlob) {
            console.log(`[Cache] Found pre-recorded audio in cache for key: ${key}`);
            return cachedBlob;
        }

        console.log(`[Cache] Fetching pre-recorded audio from network: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        const networkBlob = await response.blob();
        await cacheAudio(key, networkBlob);
        return networkBlob;

    } catch (error) {
        console.error(`Failed to fetch or cache audio for key ${key} from ${url}:`, error);
        return null;
    }
};