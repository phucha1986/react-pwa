// Downloads clean Twemoji (CC-BY 4.0) fruit images into src/pages/FruitGame/logos/
// so the Fruit games can use real PNGs instead of raw emoji.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../src/pages/FruitGame/logos');

// key: [display name, emoji]. Emoji is the source of truth for the codepoint.
const fruits = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
  grape: '🍇',
  lemon: '🍋',
  mango: '🥭',
  orange: '🍊',
  peach: '🍑',
  pear: '🍐',
  pineapple: '🍍',
  strawberry: '🍓',
  watermelon: '🍉',
  kiwi: '🥝',
  coconut: '🥥',
  blueberry: '🫐',
  melon: '🍈',
  avocado: '🥑',
  olive: '🫒',
};

const base = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';
const PNG_SIG = '89504e47';

await mkdir(outDir, { recursive: true });

let ok = 0;
let failed = [];
for (const [key, emoji] of Object.entries(fruits)) {
  const cp = emoji.codePointAt(0).toString(16).padStart(4, '0');
  try {
    const res = await fetch(base + cp + '.png');
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.status !== 200 || buf.length < 400 || buf.slice(0, 4).toString('hex') !== PNG_SIG) {
      failed.push(key);
      continue;
    }
    await writeFile(path.join(outDir, `${key}.png`), buf);
    ok += 1;
  } catch {
    failed.push(key);
  }
}

console.log(`Downloaded ${ok}/${Object.keys(fruits).length} fruit images to ${outDir}`);
if (failed.length) console.log('FAILED:', failed.join(', '));
