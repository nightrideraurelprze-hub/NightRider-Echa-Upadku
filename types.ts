

export interface PanelPromptData {
  text: string;
  imagePrompt: string;
  soundscapePrompt: string;
}

export interface PanelData {
  text: string;
  imageUrl: string;
  soundscape: string;
}

export type PanelsCache = {
  [key: string]: PanelData[];
};