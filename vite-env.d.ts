// FIX: Reverted from an `import` to the standard Vite triple-slash directive (`/// <reference ... />`).
// Using `import` turned this file into a module, which prevented the interfaces below from augmenting
// the global `ImportMeta` type, causing TypeScript errors on `import.meta.env`.
// This change ensures the types are applied globally as intended.
/// <reference types="vite/client" />

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
