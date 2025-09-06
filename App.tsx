import React from 'react';
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
    narrationAudioBlob,
    isAudioUnlocked,
  } = state;
  
  const {
    goToNextPanel,
    goToPrevPanel,
    handleSelectChapter,
    handleToggleTts,
    handleToggleMusic,
    handleUserInteraction,
  } = actions;
  
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
      <NarrationPlayer blob={narrationAudioBlob} isPlaying={isTtsEnabled && isAudioUnlocked} />
    </div>
  );
};

export default App;