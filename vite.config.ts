import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Ładuje zmienne środowiskowe z pliku .env w zależności od trybu (development, production)
    const env = loadEnv(mode, process.cwd(), '');
    return {
      define: {
        // Zastępuje `process.env.*` w kodzie wartościami ze zmiennych środowiskowych.
        // Vite wymaga prefiksu VITE_ dla zmiennych dostępnych w kodzie klienta.
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.ELEVENLABS_API_KEY': JSON.stringify(env.VITE_ELEVENLABS_API_KEY),
        // FIX: Correctly define USE_API as a boolean literal based on the environment variable.
        // The default is true unless VITE_USE_API is explicitly set to 'false'.
        'process.env.USE_API': env.VITE_USE_API !== 'false'
      },
      resolve: {
        alias: {
          // Umożliwia używanie aliasu '@' do importowania z głównego katalogu
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});