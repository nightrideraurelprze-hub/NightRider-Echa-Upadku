import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { ComicPanel } from './components/ComicPanel';
import { Navigation } from './components/Navigation';
import { generateStoryPanels, generatePostApocalypticImage, generateAtmosphericText, translatePanels } from './services/geminiService';
import { STORY_TEXT } from './constants';
import type { PanelData, PanelsCache } from './types';
import { useLanguage } from './hooks/useLanguage';

const App: React.FC = () => {
  const [sourcePanels, setSourcePanels] = useState<PanelData[]>([]);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>([]);
  const [panelsCache, setPanelsCache] = useState<PanelsCache>({ pl: [] });
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const { t, loadingMessages, language, languageName } = useLanguage();

  useEffect(() => {
    setLoadingMessage(loadingMessages[0] || 'Initializing systems...');
    
    const fetchAndCreateComic = async () => {
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);

      let hasError = false;
      try {
        const panelPrompts = await generateStoryPanels(STORY_TEXT);

        const panelDataPromises = panelPrompts.map(async (panel) => {
          const [imageUrl, soundscape] = await Promise.all([
            generatePostApocalypticImage(panel.imagePrompt),
            generateAtmosphericText(panel.soundscapePrompt),
          ]);
          return { text: panel.text, imageUrl, soundscape };
        });

        const results = await Promise.all(panelDataPromises);
        setSourcePanels(results);
        setDisplayedPanels(results);
        setPanelsCache({ pl: results });
      } catch (error) {
        hasError = true;
        console.error("Failed to generate comic book panels:", error);
        setLoadingMessage(t('criticalError'));
      } finally {
        clearInterval(messageInterval);
        if (!hasError) {
           setIsLoading(false);
        }
      }
    };

    fetchAndCreateComic();
  }, [loadingMessages, t]);

  useEffect(() => {
    if (!sourcePanels.length) return;

    const handleLanguageChange = async () => {
      if (panelsCache[language]) {
        setDisplayedPanels(panelsCache[language]);
      } else {
        setIsTranslating(true);
        try {
          const translated = await translatePanels(sourcePanels, languageName);
          setPanelsCache(prev => ({ ...prev, [language]: translated }));
          setDisplayedPanels(translated);
        } catch (error) {
          console.error(`Failed to translate story to ${language}:`, error);
          // Fallback to source language if translation fails
          setDisplayedPanels(sourcePanels);
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
  }, [goToNextPanel, goToPrevPanel]);


  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-black text-gray-300 font-sans flex flex-col">
      <Header />
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
    </div>
  );
};

export default App;