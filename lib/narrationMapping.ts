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
  // --- Rozdział 1 (2 panele) ---
  'chapter-1_panel-1': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-1_panel-2': 'REPLACE_WITH_YOUR_AUDIO_URL',
  
  // --- Rozdział 2 (3 panele) ---
  'chapter-2_panel-3': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-2_panel-4': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-2_panel-5': 'REPLACE_WITH_YOUR_AUDIO_URL',
  
  // --- Rozdział 3 (4 panele) ---
  'chapter-3_panel-6': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-7': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-8': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-3_panel-9': 'REPLACE_WITH_YOUR_AUDIO_URL',
  
  // --- Rozdział 4 (4 panele) ---
  'chapter-4_panel-10': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-4_panel-11': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-4_panel-12': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-4_panel-13': 'REPLACE_WITH_YOUR_AUDIO_URL',

  // --- Rozdział 5 (4 panele) ---
  'chapter-5_panel-14': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-5_panel-15': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-5_panel-16': 'REPLACE_WITH_YOUR_AUDIO_URL',
  'chapter-5_panel-17': 'REPLACE_WITH_YOUR_AUDIO_URL',
  
  // Dodaj więcej kluczy dla kolejnych rozdziałów w miarę ich implementacji...
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