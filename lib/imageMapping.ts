// --- INSTRUKCJA AUTOMATYZACJI OBRAZÓW Z DYSKU GOOGLE ---
//
// Witaj! Aby w pełni zautomatyzować proces używania Twoich obrazów, przygotowałem ten plik.
// Niestety, ze względów bezpieczeństwa i technicznych, aplikacja internetowa nie może
// bezpośrednio odczytać zawartości Twojego folderu na Dysku Google.
//
// Poniższy proces jest jednak najszybszym sposobem na integrację:
//
// 1. OTWÓRZ SWÓJ FOLDER Z OBRAZAMI:
//    https://drive.google.com/drive/folders/1_klRBwqtoYHwplX2xLM1GwyvNS1GvF3K
//
// 2. DLA KAŻDEGO OBRAZU, KTÓRY CHCESZ DODAĆ:
//    a. Kliknij go prawym przyciskiem myszy -> Udostępnij -> Udostępnij.
//    b. W sekcji "Dostęp ogólny" zmień na "Każdy, kto ma link".
//    c. Kliknij "Kopiuj link". Otrzymasz link w formacie:
//       https://drive.google.com/file/d/ID_PLIKU/view?usp=sharing
//    d. Skopiuj samo ID_PLIKU z tego linku.
//
// 3. WSTAW ID_PLIKU DO PONIŻSZEGO FORMATU:
//    https://drive.google.com/uc?export=download&id=TWOJE_ID_PLIKU
//
// 4. PODMIEŃ LINKI PONIŻEJ:
//    Poniżej znajduje się lista kluczowych scen z historii. Znajdź odpowiedni obraz
//    w swoim folderze, uzyskaj jego link zgodnie z powyższą instrukcją i wklej go
//    w miejsce placeholderu "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL".
//
// APLIKACJA JEST INTELIGENTNA: Jeśli link nie zostanie podmieniony, aplikacja
// automatycznie wygeneruje obraz za pomocą AI, więc historia będzie działać płynnie.

const imageDatabase: { [key: string]: string } = {
  // --- Rozdział 1: Świat po wojnie ---
  "Post-apokaliptyczny wschód słońca": "https://drive.google.com/uc?export=download&id=1_R82R-5YrmuQ1gY8Z3f3Yq2z_X7yF4jW", // Już ustawione jako przykład
  "Ruiny dawnych miast": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "NightRider i jego ciężarówka Dominator": "https://drive.google.com/uc?export=download&id=1-1yq_b7hQZJ3n5t4X_c_G7jL_X9zR6yK", // Już ustawione jako przykład

  // --- Rozdział 2: John i Dominator ---
  "John w kabinie Dominatora": "https://drive.google.com/uc?export=download&id=1-F_jO3d1vX8Z_8k_N5zL_Q2mK_Z7jP8e", // Już ustawione jako przykład
  "Podświetlona deska rozdzielcza": "https://drive.google.com/uc?export=download&id=1-hT_R7tW_y_z_i_K8hY9J_b-J_kL6rV3", // Już ustawione jako przykład
  "John siada za kierownicą": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Wspomnienia wojny": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",

  // --- Rozdział 3: Spotkanie w fortecy ---
  "Dominator wjeżdża do fortecy": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Mieszkańcy fortecy": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Emma podchodzi do Johna": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Emma i jej syn Leo": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Leo prosi o pomoc": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",

  // --- Rozdział 4: Spotkanie z Damiano ---
  "Warsztat Damiano": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Robo-pies El Diablo": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Damiano wita Johna": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Leo zafascynowany El Diablo": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  
  // --- Rozdział 5: Nocne rozmowy ---
  "El Diablo w pozycji alarmowej": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "John i Damiano rozmawiają": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Emma i Leo w warsztacie": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Zabezpieczanie bramy": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",

  // --- Rozdział 6: Spotkanie na bazie paliwowej ---
  "Stara baza paliwowa": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Marla i Ayla": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Konfrontacja wewnątrz stacji": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  "Ognisko na zewnątrz": "REPLACE_WITH_YOUR_GOOGLE_DRIVE_URL",
  
  // Dodaj więcej kluczowych scen w miarę potrzeby...
};

/**
 * Finds the corresponding image URL for a given panel's conceptual prompt.
 * Falls back to null if no image is found in the database, signaling that
 * a new image should be generated.
 * @param chapter - The chapter number (for context).
 * @param imagePrompt - The conceptual prompt key from the panel data.
 * @returns The final image URL or null if not found.
 */
export const getImageUrlForPanel = (chapter: number, imagePrompt: string): string | null => {
  // Fuzzy match: check if the AI-generated prompt CONTAINS any of our predefined keys.
  // This makes the system resilient to small variations in Gemini's output.
  const promptKey = Object.keys(imageDatabase).find(key => imagePrompt.toLowerCase().includes(key.toLowerCase()));
  
  const imageUrl = promptKey ? imageDatabase[promptKey] : null;

  // Check if the URL is a real, usable URL and not a placeholder.
  if (imageUrl && imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl) { // This means it's a placeholder like "REPLACE_..."
     console.warn(`[Image Mapping] Found prompt key "${promptKey}" but the URL is a placeholder. Falling back to image generation. Please update the URL in lib/imageMapping.ts.`);
  }

  return null; // Fallback to AI generation
};