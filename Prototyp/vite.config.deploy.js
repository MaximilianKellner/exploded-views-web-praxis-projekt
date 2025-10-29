import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true // Erlaubt den Zugriff aus dem lokalen Netzwerk
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
