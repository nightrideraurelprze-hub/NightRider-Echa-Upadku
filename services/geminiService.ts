import { GoogleGenAI, Type } from "@google/genai";
import type { PanelPromptData, PanelData } from '../types';

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
    if (!ai) {
        const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
        if (!apiKey) {
            throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}


const panelSchema = {
  type: Type.OBJECT,
  properties: {
    text: {
      type: Type.STRING,
      description: "The short, narrative text for this single comic book panel. Should be 1-3 sentences long."
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A short, conceptual description of the image content for this panel. This is used as a key and should be unique and descriptive (e.g., 'John at the wheel', 'Emma approaches the fortress')."
    },
    soundscapePrompt: {
      type: Type.STRING,
      description: "A short prompt for a text generator to describe the atmospheric sounds of this specific panel in one sentence."
    },
    speakerGender: {
        type: Type.STRING,
        description: "Identify who is speaking or if it's narration. Options: 'narrator' for descriptive text, 'male' for male characters, 'female' for female characters, or 'machine' for non-human/synthetic voices.",
        enum: ['narrator', 'male', 'female', 'machine']
    }
  },
  required: ["text", "imagePrompt", "soundscapePrompt", "speakerGender"]
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      
      const errorString = JSON.stringify(error) || error?.message || '';

      // Check for non-retriable daily quota error first.
      if (errorString.includes('PredictRequestsPerDay')) {
         console.error("Daily API quota exceeded. Aborting retries.", error);
         throw new Error("DAILY_QUOTA_EXCEEDED");
      }
      
      const isRetriable = 
        errorString.includes('429') || 
        errorString.includes('RESOURCE_EXHAUSTED') ||
        errorString.includes('503') ||
        errorString.includes('500') ||
        errorString.includes('UNAVAILABLE');
        

      if (isRetriable && attempt < maxRetries) {
        console.warn(`Retriable error detected: "${errorString}". Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        console.error(`Function failed after ${attempt} attempts or due to a non-retriable error.`, error);
        throw error; // Re-throw the original error
      }
    }
  }
  // This line should be unreachable
  throw new Error("Function failed after maximum retries.");
}


/**
 * Splits a long story text into structured comic book panels using the Gemini API.
 * @param storyText The full text of the story.
 * @returns A promise that resolves to an array of panel prompt data.
 */
export const generateStoryPanels = (storyText: string): Promise<PanelPromptData[]> => withRetry(async () => {
    const response = await getAiInstance().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following post-apocalyptic story and break it down into a series of distinct, sequential comic book panels. For each panel, provide a short narrative text, a conceptual image prompt (as a key), a brief soundscape prompt, and identify the speaker's gender ('narrator', 'male', 'female', 'machine'). Ensure the panels logically follow the story's progression. Here is the story: ${storyText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            panels: {
              type: Type.ARRAY,
              items: panelSchema,
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    if (!parsed.panels) {
        throw new Error("API response for story panels is malformed.");
    }
    return parsed.panels;
});

/**
 * Generates descriptive text based on a prompt using the Gemini Flash model.
 * @param prompt The text prompt for the AI.
 * @returns A promise that resolves to the generated text.
 */
export const generateAtmosphericText = (prompt: string): Promise<string> => withRetry(async () => {
    const response = await getAiInstance().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
});

/**
 * Translates the textual content of comic book panels to a target language.
 * @param panels The array of panel data to translate.
 * @param targetLanguage The target language (e.g., "English", "Polish").
 * @returns A promise that resolves to an array of translated panel data.
 */
export const translatePanels = (panels: PanelData[], targetLanguage: string): Promise<PanelData[]> => withRetry(async () => {
    const response = await getAiInstance().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the 'text' and 'soundscape' fields for each object in the following JSON array into ${targetLanguage}. Do not translate any other fields like 'imageUrl', 'chapter', or 'speakerGender'. Maintain the original JSON structure. Here is the data: ${JSON.stringify(panels)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              soundscape: { type: Type.STRING },
              chapter: { type: Type.NUMBER },
              speakerGender: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
});