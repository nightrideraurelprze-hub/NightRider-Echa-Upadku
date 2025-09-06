import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { ComicPanel } from './components/ComicPanel';
import { Navigation } from './components/Navigation';
import { AudioPlayer } from './components/AudioPlayer';
import { generateStoryPanels, generatePostApocalypticImage, generateAtmosphericText, translatePanels } from './services/geminiService';
import { STORY_TEXT } from './constants';
import type { PanelData, PanelsCache } from './types';
import { useLanguage } from './hooks/useLanguage';
import { getTrackForSoundscape } from './lib/audioTracks';
import { mockPanelData, mockTranslatedPanelData } from './lib/mockPanelData';

// --- PREVIEW MODE SWITCH ---
// Set to `false` to use local mock data instead of calling the Gemini API.
// This is useful for UI development when the API quota is exhausted.
const USE_API = false;

const App: React.FC = () => {
  const [sourcePanels, setSourcePanels] = useState<PanelData[]>([]);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>([]);
  const [panelsCache, setPanelsCache] = useState<PanelsCache>({ pl: [] });
  const [currentPanelIndex, setCurrentPanelIndex] = useState<number>(() => {
    try {
      const savedIndex = localStorage.getItem('nightrider-panel-index');
      const parsedIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
      return isNaN(parsedIndex) ? 0 : parsedIndex;
    } catch (error) {
      console.error("Failed to read panel index from localStorage", error);
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const { t, language, languageName } = useLanguage();
  
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nightrider-tts-enabled') === 'true';
    } catch (error) {
      console.error("Failed to read TTS preference from localStorage", error);
      return false;
    }
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nightrider-music-enabled') === 'true';
    } catch (error) {
      console.error("Failed to read Music preference from localStorage", error);
      return false;
    }
  });

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndCreateComic = async () => {
      setIsLoading(true);
      if (!USE_API) {
        console.log("--- RUNNING IN PREVIEW MODE ---");
        setLoadingMessage('Loading from local preview data...');
        // Simulate a short delay for a better user experience
        setTimeout(() => {
          setSourcePanels(mockPanelData);
          setPanelsCache({
            pl: mockPanelData,
            en: mockTranslatedPanelData
          });
          // Set initial displayed panels based on current language
          const initialLang = localStorage.getItem('nightrider-language') || 'pl';
          setDisplayedPanels(initialLang === 'en' ? mockTranslatedPanelData : mockPanelData);
          setIsLoading(false);
        }, 500);
        return;
      }

      let hasError = false;
      try {
        const chapters = STORY_TEXT.trim().split(/\n\s*\nRozdział/).map((chunk, index) => {
          if (index === 0) return chunk.replace(/^Rozdział\s*\d+:\s*/, '');
          return 'Rozdział' + chunk;
        });

        const totalChapters = chapters.length;
        let allPanels: PanelData[] = [];

        for (let i = 0; i < totalChapters; i++) {
            const chapterText = chapters[i];
            
            setLoadingMessage(t('generatingChapter', { current: i + 1, total: totalChapters }));
            const panelPrompts = await generateStoryPanels(chapterText);
            
            const chapterPanels: PanelData[] = [];
            const totalPanelsInChapter = panelPrompts.length;

            for (let j = 0; j < totalPanelsInChapter; j++) {
              setLoadingMessage(t('generatingImagesForChapter', { current: j + 1, total: totalPanelsInChapter, chapter: i + 1 }));
              const panel = panelPrompts[j];
              const [imageUrl, soundscape] = await Promise.all([
                  generatePostApocalypticImage(panel.imagePrompt),
                  generateAtmosphericText(panel.soundscapePrompt),
              ]);
              chapterPanels.push({ text: panel.text, imageUrl, soundscape, chapter: i + 1 });
            }

            allPanels = [...allPanels, ...chapterPanels];
        }
        
        if (currentPanelIndex >= allPanels.length) {
          setCurrentPanelIndex(0);
        }

        setSourcePanels(allPanels);
        setDisplayedPanels(allPanels);
        setPanelsCache({ pl: allPanels });

      } catch (error: any) {
        hasError = true;
        console.error("Failed to generate comic book panels:", error);
        if (error?.message === 'DAILY_QUOTA_EXCEEDED') {
            setLoadingMessage(t('dailyQuotaError'));
        } else {
            setLoadingMessage(t('criticalError'));
        }
      } finally {
        if (!hasError) {
           setIsLoading(false);
        }
      }
    };

    fetchAndCreateComic();
  }, [t]);

  useEffect(() => {
    try {
      if (!isLoading) {
        localStorage.setItem('nightrider-panel-index', String(currentPanelIndex));
      }
    } catch (error) {
      console.error("Failed to save panel index to localStorage", error);
    }
  }, [currentPanelIndex, isLoading]);

  useEffect(() => {
    try {
      localStorage.setItem('nightrider-tts-enabled', String(isTtsEnabled));
    } catch (error) {
      console.error("Failed to save TTS preference to localStorage", error);
    }
  }, [isTtsEnabled]);
  
  useEffect(() => {
    try {
      localStorage.setItem('nightrider-music-enabled', String(isMusicEnabled));
    } catch (error) {
      console.error("Failed to save Music preference to localStorage", error);
    }
  }, [isMusicEnabled]);

  useEffect(() => {
    window.speechSynthesis.cancel();

    if (isTtsEnabled && displayedPanels.length > 0 && displayedPanels[currentPanelIndex]) {
      const panel = displayedPanels[currentPanelIndex];
      const textToSpeak = `${panel.text}\n\n${panel.soundscape}`;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'pl' ? 'pl-PL' : 'en-US';
      
      const speakTimeout = setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

      return () => {
        clearTimeout(speakTimeout);
        window.speechSynthesis.cancel();
      };
    }
  }, [currentPanelIndex, isTtsEnabled, displayedPanels, language]);

  useEffect(() => {
    if (isMusicEnabled && displayedPanels.length > 0 && displayedPanels[currentPanelIndex]) {
      const panel = displayedPanels[currentPanelIndex];
      const track = getTrackForSoundscape(panel.soundscape);
      setCurrentTrack(track);
    } else {
      setCurrentTrack(null);
    }
  }, [currentPanelIndex, isMusicEnabled, displayedPanels]);

  useEffect(() => {
    if (!sourcePanels.length) return;

    const handleLanguageChange = async () => {
      if (panelsCache[language] && panelsCache[language].length > 0) {
        setDisplayedPanels(panelsCache[language]);
      } else if (USE_API) { // Only call API if USE_API is true
        setIsTranslating(true);
        try {
          const translated = await translatePanels(sourcePanels, languageName);
          setPanelsCache(prev => ({ ...prev, [language]: translated }));
          setDisplayedPanels(translated);
        } catch (error) {
          console.error(`Failed to translate story to ${language}:`, error);
          setDisplayedPanels(sourcePanels); // Fallback to source
        } finally {
          setIsTranslating(false);
        }
      }
    };

    handleLanguageChange();
  }, [language, languageName, sourcePanels, panelsCache]);
  
  const goToNextPanel = useCallback(() => {
    setCurrentPanelIndex(prevIndex => Math.min(prevIndex + 1, displayedPanels.length - 1));
  }, [displayedPanels.length]);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanelIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading || isTranslating) return;
      if (event.key === 'ArrowRight') {
        goToNextPanel();
      } else if (event.key === 'ArrowLeft') {
        goToPrevPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextPanel, goToPrevPanel, isLoading, isTranslating]);

  const handleSelectChapter = useCallback((chapterNumber: number) => {
    const firstPanelOfChapterIndex = displayedPanels.findIndex(p => p.chapter === chapterNumber);
    if (firstPanelOfChapterIndex !== -1) {
      setCurrentPanelIndex(firstPanelOfChapterIndex);
    }
  }, [displayedPanels]);

  const handleToggleTts = useCallback(() => setIsTtsEnabled(prev => !prev), []);
  const handleToggleMusic = useCallback(() => setIsMusicEnabled(prev => !prev), []);

  const totalChapters = displayedPanels.length > 0 ? Math.max(...displayedPanels.map(p => p.chapter)) : 0;
  const currentChapter = displayedPanels[currentPanelIndex]?.chapter || 0;

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-black text-gray-300 font-sans flex flex-col">
      <Header 
        totalChapters={totalChapters}
        currentChapter={currentChapter}
        onSelectChapter={handleSelectChapter}
        isTtsEnabled={isTtsEnabled}
        onToggleTts={handleToggleTts}
        isMusicEnabled={isMusicEnabled}
        onToggleMusic={handleToggleMusic}
      />
      <main className="flex-grow relative flex items-center justify-center">
        {displayedPanels.length > 0 && (
          <ComicPanel 
            panel={displayedPanels[currentPanelIndex]} 
            isVisible={true}
            isTranslating={isTranslating}
          />
        )}
      </main>
      <Navigation
        currentIndex={currentPanelIndex}
        totalPanels={displayedPanels.length}
        onNext={goToNextPanel}
        onPrev={goToPrevPanel}
      />
      <AudioPlayer src={currentTrack} isPlaying={isMusicEnabled} />
    </div>
  );
};

export default App;
