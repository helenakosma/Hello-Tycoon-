import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite build configuration for Hello, Tycoon!
 *
 * The important bit for teachers: this is tuned so that `npm run build` produces
 * a `dist/` folder that works when a student DOUBLE-CLICKS dist/index.html
 * (a file:// URL), with no web server at all.
 *
 * Three settings make that possible:
 *   base: './'              -> all asset URLs are relative, not absolute (/assets/...)
 *   format: 'iife'          -> output is a classic <script>, not an ES module
 *                             (browsers refuse to load ES modules over file://)
 *   inlineDynamicImports    -> everything lands in ONE js file, so there are no
 *                             cross-file module fetches to be blocked
 *
 * scripts/postbuild.mjs then strips the leftover type="module" attribute that
 * Vite always writes into index.html. See that file for details.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Keep the built JS readable-ish in case a teacher wants to peek. Flip to
    // true for a smaller file; the game is small enough that it doesn't matter.
    minify: true,
    // Inline small assets so there are fewer loose files to copy around.
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'game.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  server: {
    port: 5173,
    open: true, // pop the browser automatically when a student runs `npm start`
  },
});
