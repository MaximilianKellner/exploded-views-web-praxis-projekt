import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    open: true
  },
  resolve: {
    alias: {
      // Alias zeigt auf lokales Paket
      '@exploded-view': resolve(__dirname, '../../Prototyp/src')
    }
  }
});
