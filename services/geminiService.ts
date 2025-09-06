import { GoogleGenAI, Type } from "@google/genai";
import type { PanelPromptData, PanelData } from '../types';

// This check is important for the live API mode, but won't block preview mode.
if (process.env.NODE_ENV !== 'test' && !process.env.API_KEY) {
  // In a real app, you might want a more robust way to handle this
  // but for this project, we assume it's set when USE_API is true.
  console.warn("API_KEY environment variable not set. The app will only work in preview mode.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const panelSchema = {
  type: Type.OBJECT,
  properties: {
    text: {
      type: Type.STRING,
      description: "The short, narrative text for this single comic book panel. Should be 1-3 sentences long."
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A highly detailed, cinematic, and photorealistic prompt for an image generator (like Imagen) to create a visual for this specific panel. Describe the scene, characters, lighting, and mood. Specify 16:9 aspect ratio. Avoid depicting graphic violence or explicit content."
    },
    soundscapePrompt: {
      type: Type.STRING,
      description: "A short prompt for a text generator to describe the atmospheric sounds of this specific panel in one sentence."
    }
  },
  required: ["text", "imagePrompt", "soundscapePrompt"]
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
        errorString.includes('UNAVAILABLE') ||
        errorString.includes('No image was generated');

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following post-apocalyptic story and break it down into a series of distinct, sequential comic book panels. For each panel, provide a short narrative text, a detailed image prompt, and a brief soundscape prompt. Ensure the panels logically follow the story's progression. Here is the story: ${storyText}`,
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
 * Generates an image based on a textual prompt using the Imagen model.
 * @param prompt The text prompt to generate an image from.
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
export const generatePostApocalypticImage = (prompt: string): Promise<string> => withRetry(async () => {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      console.warn("API returned no images for prompt:", prompt);
      console.log("Full API response for failed image generation:", response);
      throw new Error("No image was generated by the API.");
    }
});

/**
 * Generates descriptive text based on a prompt using the Gemini Flash model.
 * @param prompt The text prompt for the AI.
 * @returns A promise that resolves to the generated text.
 */
export const generateAtmosphericText = (prompt: string): Promise<string> => withRetry(async () => {
    const response = await ai.models.generateContent({
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the 'text' and 'soundscape' fields for each object in the following JSON array into ${targetLanguage}. Do not translate any other fields like 'imageUrl' or 'chapter'. Maintain the original JSON structure. Here is the data: ${JSON.stringify(panels)}`,
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
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
});
