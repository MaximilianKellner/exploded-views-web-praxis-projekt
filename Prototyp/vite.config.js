import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true // Erlaubt den Zugriff aus dem lokalen Netzwerk
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/ExplodedViewer.js'),
      name: 'ExplodedViewer',
      // the proper extensions will be added
      fileName: 'exploded-viewer',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['three', 'tweakpane', 'animejs', 'stats.js'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          three: 'THREE',
          tweakpane: 'Tweakpane',
          animejs: 'anime',
          'stats.js': 'Stats',
        },
      },
    },
  },
});