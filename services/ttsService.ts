// FIX: The main client class from the ElevenLabs SDK is 'ElevenLabsClient', not 'ElevenLabs'. Reverting the class name fixes type and constructor errors.
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { PanelData } from '../types';

// Assigning unique, distinct voices for better immersion.
const NARRATOR_VOICE_ID = 'pNInz6obpgU5sV9ADbT4'; // Adam: Deep, professional, perfect for narration.
const MALE_VOICE_ID = 'yoZ06aMzmToKcTNBGrbW';     // Sam: A more rugged, deep voice for characters like John.
const FEMALE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';   // Rachel: A clear, versatile female voice.
const MACHINE_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';  // Fin: A synthetic voice for AI/machines.

// FIX: Corrected type to ElevenLabsClient. 'ElevenLabs' is a namespace and cannot be used as a type.
let elevenlabs: ElevenLabsClient | null = null;

// FIX: Corrected return type to ElevenLabsClient.
function getElevenLabsClient(): ElevenLabsClient {
    if (!elevenlabs) {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        if (!apiKey) {
            throw new Error("ElevenLabs API key is not configured. Please set the VITE_ELEVENLABS_API_KEY environment variable.");
        }
        // FIX: Corrected constructor to use ElevenLabsClient. 'ElevenLabs' is not constructable.
        elevenlabs = new ElevenLabsClient({ apiKey });
    }
    return elevenlabs;
}

/**
 * Generates speech audio from text using the ElevenLabs API SDK.
 * @param text The text to convert to speech.
 * @param speakerGender The gender of the speaker to select an appropriate voice.
 * @returns A promise that resolves to an audio Blob.
 */
export const generateSpeech = async (text: string, speakerGender: PanelData['speakerGender']): Promise<Blob> => {
    const elevenlabsClient = getElevenLabsClient();

    let voiceId: string;
    switch (speakerGender) {
        case 'narrator':
            voiceId = NARRATOR_VOICE_ID;
            break;
        case 'male':
            voiceId = MALE_VOICE_ID;
            break;
        case 'female':
            voiceId = FEMALE_VOICE_ID;
            break;
        case 'machine':
            voiceId = MACHINE_VOICE_ID;
            break;
        default:
            voiceId = NARRATOR_VOICE_ID; // Default to narrator voice.
            break;
    }

    try {
        const audioStream = await elevenlabsClient.generate({
            voice: voiceId,
            text,
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
