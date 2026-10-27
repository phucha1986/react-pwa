import { diagramHtml, renderDiagram } from '@spexcode/archify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Vite plugin — renders the Archify architecture JSON-IR (in `architecture/`)
 * into `public/architecture/{architecture.svg,architecture.html}` at `config`
 * time so the SPA can display it at `/Architecture`.
 *
 * The IR is the source of truth: edit `architecture/react-pwa.architecture.json`
 * and restart Vite to regenerate. The browser never runs Archify itself —
 * only Node (the renderer uses node:* built-ins).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const irPath = path.join(root, 'architecture', 'react-pwa.architecture.json');
const outDir = path.join(root, 'public', 'architecture');
const svgOut = path.join(outDir, 'architecture.svg');
const htmlOut = path.join(outDir, 'architecture.html');

let rendered = false;

async function renderOnce() {
  if (rendered) return;
  rendered = true;
  const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
  const parts = await renderDiagram('architecture', ir, { evidence: false });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(svgOut, parts.svg);
  fs.writeFileSync(htmlOut, diagramHtml(parts));

  const svgKB = (fs.statSync(svgOut).size / 1024).toFixed(1);
  const htmlKB = (fs.statSync(htmlOut).size / 1024).toFixed(1);
  console.log(
    `[archify] rendered → ${path.relative(root, svgOut)} (${svgKB} KB) + architecture.html (${htmlKB} KB)`,
  );
}

export default function archifyPlugin() {
  return {
    name: 'archify-architecture',
    // Run before Vite reads the public dir so the outputs are already there.
    async config() {
      await renderOnce();
    },
    // Also regenerate on `vite build` for the production bundle.
    async buildStart() {
      await renderOnce();
    },
  };
}
