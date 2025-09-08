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

const USE_API = import.meta.env.VITE_USE_API !== 'false';

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
        
        // Define the base style for all generated images.
        const imageStyleSuffix = ", post-apocalyptic, comic book art style, cinematic lighting, high detail";

        if (!imageUrl) {
            try {
                // When a custom URL is missing, generate a clearly marked placeholder.
                const placeholderPrompt = `AI-GENERATED PLACEHOLDER because a custom image was missing for the scene: "${prompt}". Please generate the described scene`;
                imageUrl = await generateImage(placeholderPrompt + imageStyleSuffix);
            } catch (imageError) {
                console.error(`Failed to generate placeholder image for prompt: "${prompt}". Falling back to static placeholder.`, imageError);
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
      loadedChaptersCount,
    };
    cacheService.saveProgressToCache(PROGRESS_CACHE_KEY, progress);
  }, [currentPanelIndex, isTtsEnabled, isMusicEnabled, hasStartedStory, isLoading, sourcePanels, panelsCache, loadedChaptersCount]);

  // Effect to load the first chapter
  useEffect(() => {
    if (!hasStartedStory || sourcePanels.length > 0) {
        setIsLoading(false);
        return;
    }

    const fetchFirstChapter = async () => {
      try {
        if (!USE_API) {
            setLoadingMessage('Loading from local preview data...');
            await new Promise(resolve => setTimeout(resolve, 500));
            setSourcePanels(mockPanelData);
            setPanelsCache({ pl: mockPanelData, en: mockTranslatedPanelData });
            setLoadedChaptersCount(STORY_CHAPTERS.length); // All mock chapters are "loaded"
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
        setIsLoading(false);
      }
    };

    fetchFirstChapter();
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