import { useState, useEffect, useCallback } from 'react';
import { generateStoryPanels, generateAtmosphericText, translatePanels, generateImage } from '../services/geminiService';
import * as ttsService from '../services/ttsService';
import { STORY_CHAPTERS } from '../lib/storyContent';
import type { PanelData, PanelsCache, SavedProgress } from '../types';
import { useLanguage } from './useLanguage';
import { getImageUrlForPanel } from '../lib/imageMapping';
import { mockPanelData, mockTranslatedPanelData } from '../lib/mockPanelData';
import { getTrackForSoundscape } from '../lib/audioTracks';
import * as cacheService from '../services/cacheService';
import { PROGRESS_CACHE_KEY } from '../constants';

// FIX: Simplified USE_API to directly use the boolean value injected by Vite.
const USE_API = process.env.USE_API;

async function initializeStoryState(t: (key: string, replacements?: { [key: string]: string | number }) => string, setLoadingMessage: (msg: string) => void) {
    if (!USE_API) {
        setLoadingMessage('Loading from local preview data...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            sourcePanels: mockPanelData,
            panelsCache: { pl: mockPanelData, en: mockTranslatedPanelData },
        };
    }

    const missingKeys = [];
    if (!process.env.API_KEY) missingKeys.push('API_KEY (for Gemini)');
    if (!process.env.ELEVENLABS_API_KEY) missingKeys.push('ELEVENLABS_API_KEY');
    if (missingKeys.length > 0) {
        const errorMsg = `Critical Error: Environment variable(s) for ${missingKeys.join(', ')} are missing.`;
        console.error(`[API Mode] ${errorMsg}`);
        throw new Error(errorMsg);
    }

    let allPanels: PanelData[] = [];
    const totalChapters = STORY_CHAPTERS.length;
    for (let i = 0; i < totalChapters; i++) {
        const chapterText = STORY_CHAPTERS[i];
        setLoadingMessage(t('generatingChapter', { current: i + 1, total: totalChapters }));
        const panelPrompts = await generateStoryPanels(chapterText);

        // 1. Select up to 3 key image prompts for the chapter
        const uniqueImagePrompts = [...new Set(panelPrompts.map(p => p.imagePrompt))];
        let keyImagePrompts: string[];
        if (uniqueImagePrompts.length <= 3) {
            keyImagePrompts = uniqueImagePrompts;
        } else {
            const middleIndex = Math.floor(uniqueImagePrompts.length / 2);
            keyImagePrompts = [
                uniqueImagePrompts[0],
                uniqueImagePrompts[middleIndex],
                uniqueImagePrompts[uniqueImagePrompts.length - 1]
            ].filter(Boolean); // Filter out potential undefined if array is small
        }

        // 2. Generate or fetch URLs for these key prompts
        const chapterImageMap = new Map<string, string>();
        setLoadingMessage(t('generatingKeyVisuals', { chapter: i + 1 }));
        for (const prompt of keyImagePrompts) {
            let imageUrl = getImageUrlForPanel(i + 1, prompt);
            if (imageUrl) {
                await cacheService.cacheImage(imageUrl);
            } else {
                try {
                    imageUrl = await generateImage(prompt);
                } catch (imageError) {
                    console.error(`Failed to generate image for prompt: "${prompt}". Falling back to placeholder.`, imageError);
                    const getPlaceholderImageUrl = (text: string) => {
                        const encodedText = encodeURIComponent(`Image Generation Failed\n${text}`);
                        return `https://placehold.co/1920x1080/000000/FFBF00/png?text=${encodedText}`;
                    };
                    imageUrl = getPlaceholderImageUrl(prompt);
                }
            }
            if (imageUrl) {
                chapterImageMap.set(prompt, imageUrl);
            }
        }

        const chapterKeyImages = Array.from(chapterImageMap.values());
        if(chapterKeyImages.length === 0) {
            // Add a default placeholder if no images could be generated/found
            chapterKeyImages.push(`https://placehold.co/1920x1080/000000/FFBF00/png?text=No+Image+Available`);
        }
        
        // 3. Create chapter panels, assigning one of the key images to each panel
        const chapterPanels: PanelData[] = [];
        for (let j = 0; j < panelPrompts.length; j++) {
            const panel = panelPrompts[j];
            const imageUrl = chapterKeyImages[j % chapterKeyImages.length];
            const soundscape = await generateAtmosphericText(panel.soundscapePrompt);
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
    return {
        sourcePanels: allPanels,
        panelsCache: { pl: allPanels, en: [] },
    };
}


export const useStoryManager = () => {
  const savedProgress = cacheService.getProgressFromCache(PROGRESS_CACHE_KEY);

  const [sourcePanels, setSourcePanels] = useState<PanelData[]>(savedProgress?.sourcePanels || []);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>(() => {
    if (savedProgress) {
      const savedLanguage = (localStorage.getItem('nightrider-language') || 'pl') as 'pl' | 'en';
      return savedProgress.panelsCache[savedLanguage] || savedProgress.sourcePanels || [];
    }
    return [];
  });
  const [panelsCache, setPanelsCache] = useState<PanelsCache>(savedProgress?.panelsCache || { pl: [], en: [] });
  const [currentPanelIndex, setCurrentPanelIndex] = useState<number>(savedProgress?.currentPanelIndex || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!savedProgress);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const { t, language, languageName } = useLanguage();
  
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(savedProgress?.isTtsEnabled ?? false);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(savedProgress?.isMusicEnabled ?? false);
  
  const [narrationAudioBlob, setNarrationAudioBlob] = useState<Blob | null>(null);
  const [isNarrationLoading, setIsNarrationLoading] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [hasStartedStory, setHasStartedStory] = useState<boolean>(savedProgress?.hasStartedStory || false);

  const handleUserInteraction = useCallback(() => {
    if (!isAudioUnlocked) {
        console.log("Audio context unlocked by user interaction.");
        setIsAudioUnlocked(true);
    }
  }, [isAudioUnlocked]);
  
  const startStory = useCallback(() => {
    handleUserInteraction();
    setHasStartedStory(true);
    setIsLoading(true);
  }, [handleUserInteraction]);

  // Consolidated save effect for user progress
  useEffect(() => {
    if (isLoading) return;

    const progress: SavedProgress = {
      version: '1.0',
      currentPanelIndex,
      isTtsEnabled,
      isMusicEnabled,
      hasStartedStory,
      sourcePanels,
      panelsCache,
    };
    cacheService.saveProgressToCache(PROGRESS_CACHE_KEY, progress);
  }, [currentPanelIndex, isTtsEnabled, isMusicEnabled, hasStartedStory, isLoading, sourcePanels, panelsCache]);

  useEffect(() => {
    if (!hasStartedStory || sourcePanels.length > 0) {
        setIsLoading(false);
        return;
    }

    const fetchAndCreateComic = async () => {
      try {
        const { sourcePanels: newSourcePanels, panelsCache: newPanelsCache } = await initializeStoryState(t, setLoadingMessage);
        setSourcePanels(newSourcePanels);
        setPanelsCache(newPanelsCache);
      } catch (error: any) {
        console.error("Failed to generate comic book panels:", error);
        const errorMessage = error?.message === 'DAILY_QUOTA_EXCEEDED' ? t('dailyQuotaError') : t('criticalError');
        setLoadingMessage(errorMessage || "An unknown error occurred during story initialization.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCreateComic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStartedStory]);
  
  useEffect(() => {
    if (!isTtsEnabled || displayedPanels.length === 0 || !hasStartedStory) {
      setNarrationAudioBlob(null);
      return;
    }

    let isMounted = true;
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
          audioBlob = await ttsService.generateSpeech(textToSpeak, currentPanel.speakerGender);
          await cacheService.cacheAudio(narrationCacheKey, audioBlob);
        }

        if (isMounted && audioBlob && audioBlob.size > 0) {
           setNarrationAudioBlob(audioBlob);
        } else {
           if (isMounted) setNarrationAudioBlob(null);
        }
      } catch (error) {
        console.error("Failed to load narration:", error);
        if (isMounted) setNarrationAudioBlob(null);
      } finally {
        if (isMounted) setIsNarrationLoading(false);
      }
    };

    loadNarration();

    return () => {
      isMounted = false;
      setNarrationAudioBlob(null);
    };
  }, [currentPanelIndex, isTtsEnabled, displayedPanels, language, hasStartedStory]);


  useEffect(() => {
    if (isMusicEnabled && displayedPanels.length > 0 && hasStartedStory) {
      setCurrentTrack(getTrackForSoundscape(displayedPanels[currentPanelIndex]?.soundscape));
    } else {
      setCurrentTrack(null);
    }
  }, [currentPanelIndex, isMusicEnabled, displayedPanels, hasStartedStory]);

  useEffect(() => {
    if (isLoading || !hasStartedStory) {
        return;
    };
    
    const handleLanguageChange = async () => {
      if (panelsCache[language] && panelsCache[language].length > 0) {
        setDisplayedPanels(panelsCache[language]);
      } else { 
        if (!USE_API) { // Preview mode fix
          const previewPanels = language === 'en' ? mockTranslatedPanelData : mockPanelData;
          setPanelsCache(prev => ({ ...prev, [language]: previewPanels }));
          setDisplayedPanels(previewPanels);
          return;
        }
        setIsTranslating(true);
        try {
          const translated = await translatePanels(sourcePanels, languageName);
          setPanelsCache(prev => ({ ...prev, [language]: translated }));
          setDisplayedPanels(translated);
        } catch (error) {
          console.error(`Failed to translate story to ${language}:`, error);
          setDisplayedPanels(sourcePanels);
        } finally {
          setIsTranslating(false);
        }
      }
    };
    handleLanguageChange();
  }, [language, languageName, sourcePanels, panelsCache, isLoading, hasStartedStory]);
  
  const goToNextPanel = useCallback(() => {
    handleUserInteraction();
    setCurrentPanelIndex(prevIndex => Math.min(prevIndex + 1, displayedPanels.length - 1));
  }, [displayedPanels.length, handleUserInteraction]);

  const goToPrevPanel = useCallback(() => {
    handleUserInteraction();
    setCurrentPanelIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, [handleUserInteraction]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isLoading || isTranslating) return;
      handleUserInteraction();
      if (event.key === 'ArrowRight') {
        goToNextPanel();
      } else if (event.key === 'ArrowLeft') {
        goToPrevPanel();
      }
  }, [goToNextPanel, goToPrevPanel, isLoading, isTranslating, handleUserInteraction]);

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
      narrationAudioBlob,
      isNarrationLoading,
      isAudioUnlocked,
      hasStartedStory,
    },
    actions: {
      goToNextPanel,
      goToPrevPanel,
      setCurrentPanelIndex,
      handleSelectChapter,
      handleToggleTts,
      handleToggleMusic,
      handleUserInteraction,
      handleKeyDown,
      startStory,
    }
  };
};