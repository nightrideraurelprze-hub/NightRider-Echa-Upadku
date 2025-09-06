import { PanelData } from '../types';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const MALE_VOICE_ID = 'pNInz6obpgU5sV9ADbT4'; // Adam (Multi-language)
const FEMALE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Multi-language)

if (!ELEVENLABS_API_KEY) {
    console.warn("ELEVENLABS_API_KEY is not set. Professional narration will not be available in API mode.");
}

/**
 * Generates speech audio from text using the ElevenLabs API.
 * @param text The text to convert to speech.
 * @param speakerGender The gender of the speaker to select an appropriate voice.
 * @returns A promise that resolves to an audio Blob.
 */
export const generateSpeech = async (text: string, speakerGender: PanelData['speakerGender']): Promise<Blob> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error("ElevenLabs API key is not configured.");
    }

    const voiceId = speakerGender === 'female' ? FEMALE_VOICE_ID : MALE_VOICE_ID;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
    };

    const body = JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
        },
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API failed with status ${response.status}: ${errorText}`);
    }

    return response.blob();
};
