// --- INSTRUKcja DODAWANIA WŁASNEJ NARRACJI ---
//
// Witaj! Ten plik pozwala na dodanie własnych, nagranych plików audio dla każdej linii
// dialogowej i narracji w komiksie. To najlepszy sposób na:
// - Oszczędność kosztów API ElevenLabs.
// - Zapewnienie najwyższej i spójnej jakości głosu.
// - Błyskawiczne ładowanie narracji bez opóźnień.
//
// JAK TO DZIAŁA:
// 1. NAGRAJ PLIK AUDIO: Nagraj lektora czytającego tekst dla konkretnego panelu.
//    Zapisz go w formacie MP3.
//
// 2. UMIEŚĆ PLIK W CHMURZE: Wrzuć plik MP3 np. na swój Dysk Google.
//
// 3. UZYSKAJ LINK DO BEZPOŚREDNIEGO POBIERANIA (ważne!):
//    a. Kliknij plik prawym przyciskiem myszy -> Udostępnij -> Udostępnij.
//    b. W sekcji "Dostęp ogólny" zmień na "Każdy, kto ma link".
//    c. Kliknij "Kopiuj link". Otrzymasz link w formacie:
//       https://drive.google.com/file/d/ID_PLIKU/view?usp=sharing
//    d. Skopiuj samo ID_PLIKU z tego linku.
//    e. WSTAW ID_PLIKU DO TEGO FORMATU:
//       https://drive.google.com/uc?export=download&id=TWOJE_ID_PLIKU
//
// 4. WKLEJ LINK PONIŻEJ:
//    Znajdź odpowiedni panel na liście poniżej i wklej swój gotowy link
//    w miejsce placeholderu "REPLACE_WITH_YOUR_AUDIO_URL".
//
// APLIKACJA JEST INTELIGENTNA: Jeśli link nie zostanie przez Ciebie podany,
// aplikacja automatycznie wygeneruje narrację za pomocą API ElevenLabs.
// Dzięki temu komiks będzie zawsze działał, a Ty możesz dodawać pliki audio stopniowo.

// Klucz to: `chapter-NUMER_ROZDZIAŁU_panel-NUMER_PANELU_W_KOLEJNOŚCI`
// Np. pierwszy panel w rozdziale 1 to 'chapter-1_panel-1'
const narrationDatabase: Record<string, string> = {
  // --- Demo Version Narration ---
  'chapter-1_panel-1': 'https://storage.googleapis.com/gemini-prod-us-central1-820540103345/030a2413-41e8-4a4b-9442-3714c3e3c9e9',
  'chapter-2_panel-2': 'https://storage.googleapis.com/gemini-prod-us-central1-820540103345/4d943204-712e-4b69-87c2-805174092497',
  'chapter-3_panel-3': 'https://storage.googleapis.com/gemini-prod-us-central1-820540103345/d7c3575c-15a0-4712-9861-1d4a04c1f9d5',
  
  // Pozostałe klucze mogą zostać dodane w przyszłości dla pełnej wersji
  'chapter-1_panel-2': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-2_panel-4': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-2_panel-5': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-6': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-7': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-8': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-9': 'REPLACE_WITH_YOUR_AUDIO_URL',
};


/**
 * Finds the corresponding pre-recorded narration URL for a given panel.
 * @param chapter The chapter number.
 * @param panelIndex The overall index of the panel in the story array.
 * @returns The audio file URL or null if not found or if it's a placeholder.
 */
export const getNarrationUrlForPanel = (chapter: number, panelIndex: number): string | null => {
  // We use panelIndex + 1 because panel indices are 0-based, but humans count from 1.
  const key = `chapter-${chapter}_panel-${panelIndex + 1}`;
  const narrationUrl = narrationDatabase[key];

  if (narrationUrl && narrationUrl.startsWith('https://')) {
    return narrationUrl;
  }
  
  if (narrationUrl) { // This means it's a placeholder like "REPLACE_..."
     console.warn(`[Narration Mapping] Found key "${key}" but the URL is a placeholder. Falling back to API generation.`);
  }

  return null; // Fallback to API generation
};