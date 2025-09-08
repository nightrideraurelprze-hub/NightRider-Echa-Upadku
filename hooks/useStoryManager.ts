import { useState, useEffect, useCallback, useRef } from 'react';
import { generateStoryPanels, generateAtmosphericText, translatePanels, generateImage } from '../services/geminiService';
import * as ttsService from '../services/ttsService';
import { STORY_CHAPTERS } from '../lib/storyContent';
import type { PanelData, PanelsCache, SavedProgress } from '../types';
import { useLanguage } from './useLanguage';
import { getImageUrlForPanel } from '../lib/imageMapping';
import { getNarrationUrlForPanel } from '../lib/narrationMapping';
import { mockPanelData, mockTranslatedPanelData } from '../lib/mockPanelData';
import { getTrackForSoundscape } from '../lib/audioTracks';
import * as cacheService from '../services/cacheService';
import { PROGRESS_CACHE_KEY } from '../constants';

// Set to true to use the API for generating story content.
// Set to false to use local mock data for development and to save API quota.
const USE_API = true;

async function loadSingleChapter(chapterText: string, chapterNumber: number, t: (key: string, replacements?: { [key: string]: string | number }) => string): Promise<PanelData[]> {
    const panelPrompts = await generateStoryPanels(chapterText);

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
        ].filter(Boolean);
    }

    const chapterImageMap = new Map<string, string>();
    if (USE_API) {
        t('generatingKeyVisuals', { chapter: chapterNumber });
    }
    for (const prompt of keyImagePrompts) {
        let imageUrl = getImageUrlForPanel(chapterNumber, prompt);
        
        if (!imageUrl) {
            try {
                console.log(`[Story Manager] Custom image not found for prompt: "${prompt}". Generating with AI.`);
                const finalImagePrompt = `${prompt}, cinematic, hyper-realistic, post-apocalyptic style`;
                imageUrl = await generateImage(finalImagePrompt);
            } catch (imageError) {
                console.error(`Failed to generate image for prompt: "${prompt}". Falling back to static placeholder.`, imageError);
                const getPlaceholderImageUrl = (text: string) => {
                    const encodedText = encodeURIComponent(`Image Generation Failed\n${text}`);
                    return `https://placehold.co/1920x1080/000000/FFBF00/png?text=${encodedText}`;
                };
                imageUrl = getPlaceholderImageUrl(prompt);
            }
        }
        if (imageUrl) {
            await cacheService.cacheImage(imageUrl);
            chapterImageMap.set(prompt, imageUrl);
        }
    }

    const chapterKeyImages = Array.from(chapterImageMap.values());
    if (chapterKeyImages.length === 0) {
        chapterKeyImages.push(`https://placehold.co/1920x1080/000000/FFBF00/png?text=No+Image+Available`);
    }

    const chapterPanels: PanelData[] = [];
    for (let j = 0; j < panelPrompts.length; j++) {
        const panel = panelPrompts[j];
        const imageUrl = chapterKeyImages[j % chapterKeyImages.length];
        const soundscape = await generateAtmosphericText(panel.soundscapePrompt);
        chapterPanels.push({
            text: panel.text,
            imageUrl,
            soundscape,
            chapter: chapterNumber,
            speakerGender: panel.speakerGender
        });
    }
    return chapterPanels;
}


export const useStoryManager = () => {
  const savedProgress = cacheService.getProgressFromCache(PROGRESS_CACHE_KEY);
  const { t, language, languageName } = useLanguage();
  
  const isFetchingInitialChapter = useRef(false);

  const [sourcePanels, setSourcePanels] = useState<PanelData[]>(savedProgress?.sourcePanels || []);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>(() => {
    if (savedProgress) {
      const savedLanguage = (localStorage.getItem('nightrider-language') || 'pl') as 'pl' | 'en';
      return savedProgress.panelsCache[savedLanguage] || savedProgress.sourcePanels || [];
    }
    return [];
  });
  const [panelsCache, setPanelsCache] = useState<PanelsCache>(savedProgress?.panelsCache || { pl: [], en: [] });
  const [loadedChaptersCount, setLoadedChaptersCount] = useState<number>(savedProgress?.loadedChaptersCount || 0);
  const [currentPanelIndex, setCurrentPanelIndex] = useState<number>(savedProgress?.currentPanelIndex || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!savedProgress);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
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
    // Loading state is managed by the main useEffect to handle pre-loading.
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
      loadedChaptersCount,
    };
    cacheService.saveProgressToCache(PROGRESS_CACHE_KEY, progress);
  }, [currentPanelIndex, isTtsEnabled, isMusicEnabled, hasStartedStory, isLoading, sourcePanels, panelsCache, loadedChaptersCount]);

  // Effect to pre-load first chapter on mount, and manage loading screen on story start.
  useEffect(() => {
    const loadFirstChapter = async () => {
      if (isFetchingInitialChapter.current || sourcePanels.length > 0) {
        return;
      }
      isFetchingInitialChapter.current = true;
      console.log("Starting to load Chapter 1...");

      try {
        if (!USE_API) {
            setLoadingMessage('Loading from local preview data...');
            await new Promise(resolve => setTimeout(resolve, 500));
            setSourcePanels(mockPanelData);
            setPanelsCache({ pl: mockPanelData, en: mockTranslatedPanelData });
            setLoadedChaptersCount(STORY_CHAPTERS.length);
            return;
        }

        setLoadingMessage(t('generatingChapter', { current: 1, total: STORY_CHAPTERS.length }));
        const firstChapterPanels = await loadSingleChapter(STORY_CHAPTERS[0], 1, t);
        setSourcePanels(firstChapterPanels);
        setPanelsCache({ pl: firstChapterPanels, en: [] });
        setLoadedChaptersCount(1);
      } catch (error: any) {
        console.error("Failed to generate first chapter:", error);
        const errorMessage = error?.message === 'DAILY_QUOTA_EXCEEDED' ? t('dailyQuotaError') : t('criticalError');
        setLoadingMessage(errorMessage || "An unknown error occurred during story initialization.");
      } finally {
        isFetchingInitialChapter.current = false;
        if (hasStartedStory) {
          setIsLoading(false);
        }
      }
    };

    if (hasStartedStory) {
      if (sourcePanels.length === 0) {
        setIsLoading(true);
        loadFirstChapter();
      } else {
        setIsLoading(false);
      }
    } else {
      // Pre-load silently on mount
      loadFirstChapter();
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStartedStory]);


  // Effect to load subsequent chapters in the background
  useEffect(() => {
      if (USE_API && hasStartedStory && loadedChaptersCount > 0 && loadedChaptersCount < STORY_CHAPTERS.length) {
          const loadNextChapter = async () => {
              const nextChapterIndex = loadedChaptersCount;
              const nextChapterNumber = nextChapterIndex + 1;
              
              console.log(`Loading chapter ${nextChapterNumber} in the background...`);
              setLoadingMessage(t('generatingChapter', { current: nextChapterNumber, total: STORY_CHAPTERS.length }));

              try {
                  const nextChapterPanels = await loadSingleChapter(STORY_CHAPTERS[nextChapterIndex], nextChapterNumber, t);
                  
                  setSourcePanels(prevPanels => [...prevPanels, ...nextChapterPanels]);
                  
                  setPanelsCache(prevCache => ({
                      ...prevCache,
                      pl: [...(prevCache.pl || []), ...nextChapterPanels]
                  }));
                  
                  setLoadedChaptersCount(prevCount => prevCount + 1);
              } catch (error) {
                  console.error(`Failed to load chapter ${nextChapterNumber} in the background:`, error);
              } finally {
                  setLoadingMessage(""); // Clear loading message after background load
              }
          };

          const timeoutId = setTimeout(loadNextChapter, 3000); 

          return () => clearTimeout(timeoutId);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedChaptersCount, hasStartedStory]);
  
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
        // 1. Check for a pre-recorded, user-provided audio file first.
        const narrationUrl = getNarrationUrlForPanel(currentPanel.chapter, currentPanelIndex);
        
        let audioBlob: Blob | null = null;

        if (narrationUrl) {
          console.log(`[Narration] Found pre-recorded audio URL for panel ${currentPanelIndex}. Fetching...`);
          audioBlob = await cacheService.fetchAndCacheAudio(narrationCacheKey, narrationUrl);
        } else {
          // 2. Fallback to API generation if no pre-recorded file is available.
          console.log(`[Narration] No pre-recorded audio found for panel ${currentPanelIndex}. Checking cache for generated audio.`);
          const cachedBlob = await cacheService.getCachedAudioBlob(narrationCacheKey);
          audioBlob = cachedBlob;

          if (!audioBlob && USE_API) {
            console.log(`[Narration] No cached audio found. Generating via API...`);
            audioBlob = await ttsService.generateSpeech(textToSpeak, currentPanel.speakerGender);
            await cacheService.cacheAudio(narrationCacheKey, audioBlob);
          }
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
    if (isLoading || !hasStartedStory) return;

    const handleLanguageChange = async () => {
        const currentLangCache = panelsCache[language];
        // Only translate if the cache for the target language is missing or incomplete
        if (!currentLangCache || currentLangCache.length < sourcePanels.length) {
            if (!USE_API) {
                const previewPanels = language === 'en' ? mockTranslatedPanelData : mockPanelData;
                setPanelsCache(prev => ({ ...prev, [language]: previewPanels }));
                setDisplayedPanels(previewPanels);
                return;
            }

            setIsTranslating(true);
            try {
                // Translate all source panels loaded so far
                const translated = await translatePanels(sourcePanels, languageName);
                setPanelsCache(prev => ({ ...prev, [language]: translated }));
                setDisplayedPanels(translated);
            } catch (error) {
                console.error(`Failed to translate story to ${language}:`, error);
                setDisplayedPanels(sourcePanels); // Fallback to source language
            } finally {
                setIsTranslating(false);
            }
        } else {
             setDisplayedPanels(currentLangCache);
        }
    };
    handleLanguageChange();
}, [language, languageName, sourcePanels, isLoading, hasStartedStory]);
  
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