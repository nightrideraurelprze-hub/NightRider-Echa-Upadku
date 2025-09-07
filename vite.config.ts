import path from 'path';
import { defineConfig } from 'vite';

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