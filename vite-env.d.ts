// FIX: The triple-slash directive was failing to resolve vite/client types.
// Switched to a direct import, which uses a different resolution mechanism.
// Wrapped the interface augmentations in `declare global` to ensure they are
// applied globally, which is necessary now that this file is a module.
import 'vite/client';

declare global {
  // Define the interface for environment variables to provide type safety for `import.meta.env`.
  interface ImportMetaEnv {
      // As per @google/genai guidelines, the Gemini API key must be obtained from `process.env.API_KEY`,
      // so `VITE_GEMINI_API_KEY` is not defined here.
      readonly VITE_ELEVENLABS_API_KEY: string;
      readonly VITE_USE_API: string;
  }

  interface ImportMeta {
      readonly env: ImportMetaEnv;
  }
}
