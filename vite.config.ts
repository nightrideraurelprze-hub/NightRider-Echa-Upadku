import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

// FIX: In an ES module, __dirname is not available by default. This adds the necessary boilerplate to define it using import.meta.url, allowing path.resolve to work as intended.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    return {
      resolve: {
        alias: {
          // Umożliwia używanie aliasu '@' do importowania z głównego katalogu
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});