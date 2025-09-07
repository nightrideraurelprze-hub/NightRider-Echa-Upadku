import React from 'react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { ComicPanel } from './components/ComicPanel';
import { Navigation } from './components/Navigation';
import { AudioPlayer } from './components/AudioPlayer';
import { useStoryManager } from './hooks/useStoryManager';
import { NarrationPlayer } from './components/NarrationPlayer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IntroScreen } from './components/IntroScreen';
import { useLanguage } from './hooks/useLanguage';

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
    narrationAudioBlob,
    isAudioUnlocked,
    hasStartedStory,
  } = state;
  
  const {
    goToNextPanel,
    goToPrevPanel,
    handleSelectChapter,
    handleToggleTts,
    handleToggleMusic,
    handleUserInteraction,
    startStory,
  } = actions;

  const { t } = useLanguage();
  
  const totalChapters = displayedPanels.length > 0 ? Math.max(...displayedPanels.map(p => p.chapter)) : 0;
  const currentChapter = displayedPanels[currentPanelIndex]?.chapter || 0;

  if (!hasStartedStory) {
    return (
      <div className="min-h-screen h-screen w-screen bg-black text-gray-300 font-sans flex flex-col">
        <IntroScreen onStart={startStory} />
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-black text-gray-300 font-sans flex flex-col" onClick={handleUserInteraction} onKeyDown={actions.handleKeyDown} tabIndex={0}>
      {isLoading ? (
        <LoadingScreen message={loadingMessage} />
      ) : (
        <>
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
          <ErrorBoundary>
            <main className="flex-grow relative flex items-center justify-center">
              {displayedPanels.length > 0 && (
                <ComicPanel 
                  panel={displayedPanels[currentPanelIndex]} 
                  isVisible={true}
                  isTtsEnabled={isTtsEnabled}
                />
              )}
              {isTranslating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 transition-opacity duration-300">
                   <div className="w-16 h-16 border-4 border-amber-500/50 border-t-amber-400 rounded-full animate-spin mb-4"></div>
                   <p className="font-display text-xl text-amber-400 tracking-wider">{t('translatingStory')}</p>
                </div>
              )}
            </main>
            {displayedPanels.length > 1 && (
              <Navigation
                currentIndex={currentPanelIndex}
                totalPanels={displayedPanels.length}
                onNext={goToNextPanel}
                onPrev={goToPrevPanel}
                onUserInteraction={handleUserInteraction}
              />
            )}
          </ErrorBoundary>
          <AudioPlayer src={currentTrack} isPlaying={isMusicEnabled && isAudioUnlocked} />
          <NarrationPlayer blob={narrationAudioBlob} isPlaying={isTtsEnabled && isAudioUnlocked} />
        </>
      )}
    </div>
  );
};

export default App;