import type { PanelData } from '../types';

const IMAGE_CACHE_NAME = 'nightrider-image-cache-v1';
const AUDIO_CACHE_NAME = 'nightrider-audio-cache-v1.1';

// --- Local Storage Cache for Story Data ---

export const getStoryFromCache = async (cacheKey: string): Promise<PanelData[] | null> => {
    try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log("Loading story from localStorage...");
            return JSON.parse(cachedData);
        }
    } catch (error) {
        console.error("Failed to load story from localStorage.", error);
        localStorage.removeItem(cacheKey); // Clear corrupted data
    }
    return null;
};

export const saveStoryToCache = async (cacheKey: string, panels: PanelData[]): Promise<void> => {
    try {
        console.log("Saving generated story to localStorage...");
        const dataString = JSON.stringify(panels);
        localStorage.setItem(cacheKey, dataString);
    } catch (error) {
        console.error("Failed to save story to localStorage.", error);
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