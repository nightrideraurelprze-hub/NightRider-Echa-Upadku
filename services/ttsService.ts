import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { PanelData } from '../types';
import { ELEVENLABS_API_KEY } from '../config';

const MALE_VOICE_ID = 'pNInz6obpgU5sV9ADbT4'; // Adam (Multi-language)
const FEMALE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Multi-language)
const MACHINE_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // Optional: A more robotic voice

let elevenlabs: ElevenLabsClient | null = null;
if (ELEVENLABS_API_KEY) {
    elevenlabs = new ElevenLabsClient({
        apiKey: ELEVENLABS_API_KEY,
    });
}

/**
 * Generates speech audio from text using the ElevenLabs API SDK.
 * @param text The text to convert to speech.
 * @param speakerGender The gender of the speaker to select an appropriate voice.
 * @returns A promise that resolves to an audio Blob.
 */
export const generateSpeech = async (text: string, speakerGender: PanelData['speakerGender']): Promise<Blob> => {
    if (!elevenlabs) {
        throw new Error("ElevenLabs API key is not configured in config.ts.");
    }

    let voiceId: string;
    switch (speakerGender) {
        case 'female':
            voiceId = FEMALE_VOICE_ID;
            break;
        case 'machine':
            voiceId = MACHINE_VOICE_ID;
            break;
        case 'male':
        case 'narrator':
        default:
            voiceId = MALE_VOICE_ID;
            break;
    }
    
    try {
        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
            output_format: 'mp3_44100_128',
        });
        
        // Convert the stream to a blob
        const chunks: Uint8Array[] = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        return blob;

    } catch (error) {
        console.error("ElevenLabs API failed:", error);
        throw new Error(`ElevenLabs API failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};