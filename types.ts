


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