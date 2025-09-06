import { useState, useEffect, useCallback } from 'react';
import { generateStoryPanels, generateAtmosphericText, translatePanels } from '../services/geminiService';
import * as ttsService from '../services/ttsService';
import { STORY_CHAPTERS } from '../constants';
import type { PanelData, PanelsCache } from '../types';
import { useLanguage } from './useLanguage';
import { getImageUrlForPanel } from '../lib/imageMapping';
import { mockPanelData, mockTranslatedPanelData } from '../lib/mockPanelData';
import { getTrackForSoundscape } from '../lib/audioTracks';
import * as cacheService from '../services/cacheService';

// --- PREVIEW MODE SWITCH ---
const USE_API = false;

// --- CACHE ---
const CACHE_VERSION = '1.1';
const STORY_CACHE_KEY = `nightrider-story-cache-v${CACHE_VERSION}`;

if (USE_API) {
  const missingKeys = [];
  if (!process.env.API_KEY) missingKeys.push('API_KEY (for Gemini)');
  if (!process.env.ELEVENLABS_API_KEY) missingKeys.push('ELEVENLABS_API_KEY');

  if (missingKeys.length > 0) {
    console.warn(`[API Mode] The following environment variables are not set: ${missingKeys.join(', ')}. The application may not function correctly.`);
  }
}

export const useStoryManager = () => {
  const [sourcePanels, setSourcePanels] = useState<PanelData[]>([]);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>([]);
  const [panelsCache, setPanelsCache] = useState<PanelsCache>({ pl: [] });
  const [currentPanelIndex, setCurrentPanelIndex] = useState<number>(() => {
    return parseInt(localStorage.getItem('nightrider-panel-index') || '0', 10);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const { t, language, languageName } = useLanguage();
  
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => localStorage.getItem('nightrider-tts-enabled') === 'true');
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => localStorage.getItem('nightrider-music-enabled') === 'true');
  
  const [narrationAudioSrc, setNarrationAudioSrc] = useState<string | null>(null);
  const [isNarrationLoading, setIsNarrationLoading] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const handleUserInteraction = useCallback(() => {
    if (!isAudioUnlocked) {
        console.log("Audio context unlocked by user interaction.");
        setIsAudioUnlocked(true);
    }
  }, [isAudioUnlocked]);


  useEffect(() => {
    const fetchAndCreateComic = async () => {
      setIsLoading(true);
      
      if (!USE_API) {
        setLoadingMessage('Loading from local preview data...');
        setTimeout(() => {
          setSourcePanels(mockPanelData);
          setPanelsCache({ pl: mockPanelData, en: mockTranslatedPanelData });
          const initialLang = localStorage.getItem('nightrider-language') || 'pl';
          setDisplayedPanels(initialLang === 'en' ? mockTranslatedPanelData : mockPanelData);
          setIsLoading(false);
        }, 500);
        return;
      }

      const cachedData = await cacheService.getStoryFromCache(STORY_CACHE_KEY);
      if (cachedData) {
        setLoadingMessage(t('loadingAssets'));
        setSourcePanels(cachedData);
        setPanelsCache({ pl: cachedData });
        setIsLoading(false);
        return;
      }
      
      let allPanels: PanelData[] = [];
      try {
        const totalChapters = STORY_CHAPTERS.length;
        for (let i = 0; i < totalChapters; i++) {
            const chapterText = STORY_CHAPTERS[i];
            setLoadingMessage(t('generatingChapter', { current: i + 1, total: totalChapters }));
            const panelPrompts = await generateStoryPanels(chapterText);
            
            const chapterPanels: PanelData[] = [];
            for (const panel of panelPrompts) {
              const soundscape = await generateAtmosphericText(panel.soundscapePrompt);
              const imageUrl = getImageUrlForPanel(i + 1, panel.imagePrompt);
              await cacheService.cacheImage(imageUrl);

              chapterPanels.push({ 
                text: panel.text, 
                imageUrl, 
                soundscape, 
                chapter: i + 1,
                speakerGender: panel.speakerGender 
              });
            }
            allPanels = [...allPanels, ...chapterPanels];
        }
        
        setSourcePanels(allPanels);
        setDisplayedPanels(allPanels);
        setPanelsCache({ pl: allPanels });
        await cacheService.saveStoryToCache(STORY_CACHE_KEY, allPanels);
      } catch (error: any) {
        console.error("Failed to generate comic book panels:", error);
        setLoadingMessage(error?.message === 'DAILY_QUOTA_EXCEEDED' ? t('dailyQuotaError') : t('criticalError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCreateComic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('nightrider-panel-index', String(currentPanelIndex));
    }
  }, [currentPanelIndex, isLoading]);

  useEffect(() => {
    localStorage.setItem('nightrider-tts-enabled', String(isTtsEnabled));
    if (!isTtsEnabled) {
      setNarrationAudioSrc(null); // Clear audio source when disabled
    }
  }, [isTtsEnabled]);
  
  useEffect(() => {
    localStorage.setItem('nightrider-music-enabled', String(isMusicEnabled));
  }, [isMusicEnabled]);
  
  useEffect(() => {
    if (!isTtsEnabled || displayedPanels.length === 0) {
      setNarrationAudioSrc(null);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;
    
    const currentPanel = displayedPanels[currentPanelIndex];
    if (!currentPanel) return;

    const textToSpeak = currentPanel.text;
    const narrationCacheKey = `narration-${language}-ch${currentPanel.chapter}-p${currentPanelIndex}-${currentPanel.speakerGender}`;

    const loadNarration = async () => {
      setIsNarrationLoading(true);
      try {
        const cachedBlob = await cacheService.getCachedAudioBlob(narrationCacheKey);
        let audioBlob = cachedBlob;

        if (!audioBlob && USE_API) {
          console.log(`Narration cache miss for key: ${narrationCacheKey}. Generating...`);
          audioBlob = await ttsService.generateSpeech(textToSpeak, currentPanel.speakerGender);
          await cacheService.cacheAudio(narrationCacheKey, audioBlob);
        } else if (audioBlob) {
          console.log(`Narration cache hit for key: ${narrationCacheKey}`);
        }

        if (isMounted && audioBlob && audioBlob.size > 0) {
          objectUrl = URL.createObjectURL(audioBlob);
          setNarrationAudioSrc(objectUrl);
        } else if (audioBlob && audioBlob.size === 0) {
          console.warn(`Received empty audio blob for key: ${narrationCacheKey}. Not playing.`);
           if (isMounted) setNarrationAudioSrc(null);
        }
      } catch (error) {
        console.error("Failed to load narration:", error);
        if (isMounted) setNarrationAudioSrc(null);
      } finally {
        if (isMounted) setIsNarrationLoading(false);
      }
    };

    loadNarration();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setNarrationAudioSrc(null); // Stop playback on navigate
    };
  }, [currentPanelIndex, isTtsEnabled, displayedPanels, language]);


  useEffect(() => {
    if (isMusicEnabled && displayedPanels.length > 0) {
      setCurrentTrack(getTrackForSoundscape(displayedPanels[currentPanelIndex]?.soundscape));
    } else {
      setCurrentTrack(null);
    }
  }, [currentPanelIndex, isMusicEnabled, displayedPanels]);

  useEffect(() => {
    if (!sourcePanels.length || isLoading) return;
    const handleLanguageChange = async () => {
      if (panelsCache[language] && panelsCache[language].length > 0) {
        setDisplayedPanels(panelsCache[language]);
      } else { 
        if (!USE_API) {
          setDisplayedPanels(sourcePanels); // Fallback for preview mode
          return;
        }
        setIsTranslating(true);
        try {
          const translated = await translatePanels(sourcePanels, languageName);
          setPanelsCache(prev => ({ ...prev, [language]: translated }));
          setDisplayedPanels(translated);
        } catch (error) {
          console.error(`Failed to translate story to ${language}:`, error);
          setDisplayedPanels(sourcePanels); // Fallback on error
        } finally {
          setIsTranslating(false);
        }
      }
    };
    handleLanguageChange();
  }, [language, languageName, sourcePanels, panelsCache, isLoading]);
  
  const handleSelectChapter = useCallback((chapterNumber: number) => {
    handleUserInteraction();
    const firstPanelOfChapterIndex = displayedPanels.findIndex(p => p.chapter === chapterNumber);
    if (firstPanelOfChapterIndex !== -1) setCurrentPanelIndex(firstPanelOfChapterIndex);
  }, [displayedPanels, handleUserInteraction]);

  const handleToggleTts = useCallback(() => {
    handleUserInteraction();
    setIsTtsEnabled(prev => !prev);
  }, [handleUserInteraction]);
  
  const handleToggleMusic = useCallback(() => {
    handleUserInteraction();
    setIsMusicEnabled(prev => !prev);
  }, [handleUserInteraction]);

  return {
    state: {
      isLoading,
      isTranslating,
      loadingMessage,
      displayedPanels,
      currentPanelIndex,
      isTtsEnabled,
      isMusicEnabled,
      currentTrack,
      narrationAudioSrc,
      isNarrationLoading,
      isAudioUnlocked,
    },
    actions: {
      setCurrentPanelIndex,
      handleSelectChapter,
      handleToggleTts,
      handleToggleMusic,
      handleUserInteraction,
    }
  };
};