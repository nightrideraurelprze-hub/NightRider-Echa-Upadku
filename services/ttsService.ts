import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { PanelData } from '../types';

const MALE_VOICE_ID = 'pNInz6obpgU5sV9ADbT4'; // Adam (Multi-language)
const FEMALE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Multi-language)
const MACHINE_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // Optional: A more robotic voice

let elevenlabs: ElevenLabsClient | null = null;

function getElevenLabsClient(): ElevenLabsClient {
    if (!elevenlabs) {
        const apiKey = typeof process !== 'undefined' ? process.env.ELEVENLABS_API_KEY : undefined;
        if (!apiKey) {
            throw new Error("ElevenLabs API key is not configured. Please set the ELEVENLABS_API_KEY environment variable.");
        }
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
    const client = getElevenLabsClient();

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
        const audioStream = await client.textToSpeech.convert(voiceId, {
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