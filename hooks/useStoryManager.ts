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
import { PROGRESS_CACHE_KEY, STORY_CACHE_KEY } from '../constants';

// Gracefully handle environments where process.env is not defined (like local static servers).
// Default to preview mode (USE_API = false) in such cases to prevent app crashes.
const USE_API = typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.USE_API !== 'false';

export const useStoryManager = () => {
  // Load initial state from consolidated progress cache
  const savedProgress = cacheService.getProgressFromCache(PROGRESS_CACHE_KEY);

  const [sourcePanels, setSourcePanels] = useState<PanelData[]>([]);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>([]);
  const [panelsCache, setPanelsCache] = useState<PanelsCache>({ pl: [], en: [] });
  const [currentPanelIndex, setCurrentPanelIndex] = useState<number>(savedProgress?.currentPanelIndex || 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  }, [handleUserInteraction]);

  // Consolidated save effect for user progress
  useEffect(() => {
    // Don't save initial default state until loading is complete and user has started
    if (isLoading || !hasStartedStory) return;

    const progress: SavedProgress = {
      version: '1.0',
      currentPanelIndex,
      isTtsEnabled,
      isMusicEnabled,
      hasStartedStory,
    };
    cacheService.saveProgressToCache(PROGRESS_CACHE_KEY, progress);
  }, [currentPanelIndex, isTtsEnabled, isMusicEnabled, hasStartedStory, isLoading]);


  useEffect(() => {
    // Do not fetch story until the user has passed the intro screen
    if (!hasStartedStory) {
        setIsLoading(false);
        return;
    }

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
      
      const missingKeys = [];
      if (!process.env.API_KEY) missingKeys.push('API_KEY (for Gemini)');
      if (!process.env.ELEVENLABS_API_KEY) missingKeys.push('ELEVENLABS_API_KEY');
      if (missingKeys.length > 0) {
        const errorMsg = `Critical Error: Environment variable(s) for ${missingKeys.join(', ')} are missing.`;
        console.error(`[API Mode] ${errorMsg}`);
        setLoadingMessage(errorMsg);
        return;
      }

      const cachedData = await cacheService.getStoryFromCache(STORY_CACHE_KEY);
      if (cachedData) {
        setLoadingMessage(t('loadingAssets'));
        setSourcePanels(cachedData);
        setPanelsCache({ pl: cachedData });
        setDisplayedPanels(cachedData);
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
            for (let j = 0; j < panelPrompts.length; j++) {
              const panel = panelPrompts[j];

              let imageUrl = getImageUrlForPanel(i + 1, panel.imagePrompt);

              if (imageUrl) {
                // If we have a pre-defined URL, pre-cache it
                await cacheService.cacheImage(imageUrl);
              } else {
                // If no pre-defined image, generate a new one
                setLoadingMessage(t('generatingImagesForChapter', { current: j + 1, total: panelPrompts.length, chapter: i + 1 }));
                try {
                    imageUrl = await generateImage(panel.imagePrompt);
                } catch (imageError) {
                    console.error(`Failed to generate image for prompt: "${panel.imagePrompt}". Falling back to placeholder.`, imageError);
                    const getPlaceholderImageUrl = (text: string) => {
                      const encodedText = encodeURIComponent(`Image Generation Failed\n${text}`);
                      return `https://placehold.co/1920x1080/000000/FFBF00/png?text=${encodedText}`;
                    };
                    imageUrl = getPlaceholderImageUrl(panel.imagePrompt);
                }
              }

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
  }, [hasStartedStory]);

  useEffect(() => {
    if (!isTtsEnabled) {
      setNarrationAudioBlob(null);
    }
  }, [isTtsEnabled]);
  
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
      if (panelsCache[language] && panelsCache[language].length > 0) {
        setDisplayedPanels(panelsCache[language]);
      } else { 
        if (!USE_API) { // Preview mode fix
          setDisplayedPanels(language === 'en' ? mockTranslatedPanelData : mockPanelData);
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