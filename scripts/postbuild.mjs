/**
 * Post-build fixer for the "just double-click index.html" workflow.
 *
 * Vite always emits <script type="module" crossorigin src="...">. Browsers
 * block ES modules and crossorigin requests on file:// URLs, so a student who
 * double-clicks dist/index.html would get a blank page.
 *
 * Because vite.config.js already builds a single IIFE bundle (not a real ES
 * module), we can safely rewrite that tag into a plain deferred script and
 * drop the <link rel="modulepreload"> hints. After this runs, dist/index.html
 * opens correctly straight from the filesystem.
 *
 * Run automatically by `npm run build`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve('dist/index.html');

if (!existsSync(indexPath)) {
  console.error('[postbuild] dist/index.html not found — did `vite build` fail?');
  process.exit(1);
}

let html = readFileSync(indexPath, 'utf8');

// 1. <script type="module" crossorigin src="./game.js"> -> <script defer src="./game.js">
html = html.replace(/<script\b[^>]*>/g, (tag) => {
  if (!tag.includes('type="module"')) return tag;
  return tag
    .replace(/\stype="module"/, ' defer')
    .replace(/\scrossorigin(?:="[^"]*")?/, '');
});

// 2. Module preload hints are meaningless for a classic script and 404 on file://
html = html.replace(/\s*<link[^>]+rel="modulepreload"[^>]*>/g, '');

writeFileSync(indexPath, html);
console.log('[postbuild] dist/index.html patched for file:// (double-click) use.');
