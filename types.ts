export interface PanelPromptData {
  text: string;
  imagePrompt: string;
  soundscapePrompt: string;
  speakerGender: 'narrator' | 'male' | 'female' | 'machine';
}

export interface PanelData {
  text: string;
  imageUrl: string;
  soundscape: string;
  chapter: number;
  speakerGender: 'narrator' | 'male' | 'female' | 'machine';
}

export type PanelsCache = {
  [key: string]: PanelData[];
};

export interface SavedProgress {
  version: string;
  currentPanelIndex: number;
  isTtsEnabled: boolean;
  isMusicEnabled: boolean;
  hasStartedStory: boolean;
  sourcePanels: PanelData[];
  panelsCache: PanelsCache;
}