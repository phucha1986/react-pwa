import type { Plugin } from 'vite';

/**
 * Vite plugin (defined in `vite-plugin-archify.mjs`) that renders the Archify
 * architecture JSON-IR into `public/architecture/` at config/build time.
 * This declaration satisfies `tsc` for the `.mjs` import in `vite.config.ts`.
 */
export default function archifyPlugin(): Plugin;
