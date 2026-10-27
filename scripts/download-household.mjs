// Downloads clean Twemoji (CC-BY 4.0) household images into
// src/pages/HouseholdGame/logos/ so the Household game can use real PNGs
// instead of the hand-drawn SVG icons.
//
// NOTE: Twemoji 14 only serves 72x72 on the jsDelivr CDN — larger sizes 404.
// The images are scaled up with CSS, matching the Fruit game's approach.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../src/pages/HouseholdGame/logos');

// key: emoji (the source of truth for the codepoint).
// Chosen to be the most "realistic" Twemoji for each household item:
const items = {
  table: '🍽️', // plate with cutlery — dining table
  chair: '🪑',
  lamp: '🪔',
  pen: '✏️',
  book: '📖',
  cup: '☕',
  clock: '⏰',
  phone: '📱',
  bed: '🛏️',
  spoon: '🥄',
  fork: '🍴', // fork & knife (no standalone fork emoji exists)
  tv: '📺',
  sofa: '🛋️',
  window: '🪟',
  door: '🚪',
  mirror: '🪞',
  shower: '🚿',
  toilet: '🚻',
  speaker: '🔊',
  key: '🔑',
  umbrella: '☂️',
  broom: '🧹',
  toiletpaper: '🧻',
};

const base = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';
// Full 8-byte PNG signature — some Twemoji PNGs are tiny (200-700 bytes),
// so we validate by signature rather than a minimum byte length.
const PNG_SIG = '89504e470d0a1a0a';

await mkdir(outDir, { recursive: true });

let ok = 0;
const failed = [];
for (const [key, emoji] of Object.entries(items)) {
  const cp = emoji.codePointAt(0).toString(16).padStart(4, '0');
  try {
    const res = await fetch(base + cp + '.png', { headers: { 'accept-encoding': 'identity' } });
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.status !== 200 || buf.slice(0, 8).toString('hex') !== PNG_SIG) {
      failed.push(key);
      continue;
    }
    await writeFile(path.join(outDir, `${key}.png`), buf);
    ok += 1;
  } catch {
    failed.push(key);
  }
}

console.log(`Downloaded ${ok}/${Object.keys(items).length} household images to ${outDir}`);
if (failed.length) console.log('FAILED:', failed.join(', '));
