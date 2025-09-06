import React, { useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { ComicPanel } from './components/ComicPanel';
import { Navigation } from './components/Navigation';
import { AudioPlayer } from './components/AudioPlayer';
import { useStoryManager } from './hooks/useStoryManager';
import { NarrationPlayer } from './components/NarrationPlayer';

const App: React.FC = () => {
  const {
    state,
    actions,
  } = useStoryManager();

  const {
    isLoading,
    isTranslating,
    loadingMessage,
    displayedPanels,
    currentPanelIndex,
    isTtsEnabled,
    isMusicEnabled,
    currentTrack,
    narrationAudioSrc,
    isAudioUnlocked,
  } = state;
  
  const {
    setCurrentPanelIndex,
    handleSelectChapter,
    handleToggleTts,
    handleToggleMusic,
    handleUserInteraction,
  } = actions;

  const goToNextPanel = useCallback(() => {
    handleUserInteraction();
    setCurrentPanelIndex(prevIndex => Math.min(prevIndex + 1, displayedPanels.length - 1));
  }, [displayedPanels.length, setCurrentPanelIndex, handleUserInteraction]);

  const goToPrevPanel = useCallback(() => {
    handleUserInteraction();
    setCurrentPanelIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, [setCurrentPanelIndex, handleUserInteraction]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading || isTranslating) return;
      handleUserInteraction();
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
  }, [goToNextPanel, goToPrevPanel, isLoading, isTranslating, handleUserInteraction]);
  
  const totalChapters = displayedPanels.length > 0 ? Math.max(...displayedPanels.map(p => p.chapter)) : 0;
  const currentChapter = displayedPanels[currentPanelIndex]?.chapter || 0;

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-black text-gray-300 font-sans flex flex-col" onClick={handleUserInteraction}>
      <Header 
        totalChapters={totalChapters}
        currentChapter={currentChapter}
        onSelectChapter={handleSelectChapter}
        isTtsEnabled={isTtsEnabled}
        onToggleTts={handleToggleTts}
        isMusicEnabled={isMusicEnabled}
        onToggleMusic={handleToggleMusic}
        onUserInteraction={handleUserInteraction}
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
        onUserInteraction={handleUserInteraction}
      />
      <AudioPlayer src={currentTrack} isPlaying={isMusicEnabled && isAudioUnlocked} />
      <NarrationPlayer src={narrationAudioSrc} isPlaying={isTtsEnabled && isAudioUnlocked} />
    </div>
  );
};

export default App;