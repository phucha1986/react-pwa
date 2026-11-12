// Generates Vietnamese speech clips for the Animal guess game using the local
// voice-ai backend (VieNeu-TTS v3 Turbo, FastAPI on http://localhost:8000).
//
// For every animal it produces 4 mp3 clips in public/audio/animals/:
//   {key}-one.mp3      "Tìm con X — có 1 con"   (1 target on the small board)
//   {key}-many-2.mp3   "Tìm tất cả con X, có 2 con"
//   {key}-many-3.mp3   "Tìm tất cả con X, có 3 con"
//   {key}-great.mp3    "Giỏi lắm! Đó là X!"
//
// Animal names are read from the vi block of src/i18n/context.ts so the clips
// always match what the game displays. WAV responses are converted to mp3
// with ffmpeg. Re-run with --force to regenerate existing clips.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/audio/animals');
const API_BASE = process.env.VOICE_API_BASE ?? 'http://localhost:8000';
const VOICE_PRESET = process.env.VOICE_PRESET ?? 'Trúc Ly';
const force = process.argv.includes('--force');

// Extract the Vietnamese animal names from the i18n vi block.
const ctx = await readFile(path.resolve(__dirname, '../src/i18n/context.ts'), 'utf8');
const viBlock = ctx.match(/animalsTitle: 'Động vật',[\s\S]*?animals: \{([\s\S]*?)\}/);
if (!viBlock) {
  console.error('Could not find the vi animals block in src/i18n/context.ts');
  process.exit(1);
}
const animals = {};
for (const m of viBlock[1].matchAll(/(\w+): '([^']+)'/g)) animals[m[1]] = m[2];
const keys = Object.keys(animals);
console.log(`Found ${keys.length} animals (vi), voice preset: ${VOICE_PRESET}`);

const phrases = [];
for (const key of keys) {
  const word = animals[key];
  phrases.push({ file: `${key}-one`, text: `Tìm con ${word}, có 1 con` });
  phrases.push({ file: `${key}-many-2`, text: `Tìm tất cả con ${word}, có 2 con` });
  phrases.push({ file: `${key}-many-3`, text: `Tìm tất cả con ${word}, có 3 con` });
  phrases.push({ file: `${key}-great`, text: `Giỏi lắm! Đó là ${word}!` });
}

await mkdir(outDir, { recursive: true });

async function generateOne({ file, text }) {
  const out = path.join(outDir, `${file}.mp3`);
  if (!force) {
    try {
      const st = await readFile(out);
      if (st.length > 1000) return 'skip';
    } catch {
      /* not generated yet */
    }
  }
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text,
      voice_id: '',
      voice_preset: VOICE_PRESET,
      language: 'vi',
      speed: 1,
      temperature: 0.4,
      seed: 42,
    }),
  });
  if (!res.ok) throw new Error(`generate ${res.status}: ${await res.text()}`);
  const job = await res.json();

  // Poll until the worker finishes the job.
  for (let i = 0; i < 120; i++) {
    const r = await fetch(`${API_BASE}/jobs/${job.id}`);
    const j = await r.json();
    if (j.status === 'done') {
      const audio = await fetch(`${API_BASE}/jobs/${job.id}/audio`);
      if (!audio.ok) throw new Error(`audio ${audio.status}`);
      const wav = Buffer.from(await audio.arrayBuffer());
      const tmpWav = path.join(outDir, `${file}.wav.tmp`);
      await writeFile(tmpWav, wav);
      await runFfmpeg(tmpWav, out);
      await writeFile(path.join(outDir, `${file}.txt`), text);
      return 'ok';
    }
    if (j.status === 'failed' || j.status === 'cancelled') {
      throw new Error(`job ${job.id} ${j.status}: ${j.error ?? ''}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`job ${job.id} timed out`);
}

function runFfmpeg(wavPath, mp3Path) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-y', '-i', wavPath, '-codec', 'libmp3lame', '-q:a', '5', mp3Path]);
    let err = '';
    p.stderr.on('data', (d) => {
      err += d;
    });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${err.slice(-300)}`));
    });
  });
}

let ok = 0;
let skipped = 0;
const failed = [];
for (const phrase of phrases) {
  try {
    const status = await generateOne(phrase);
    if (status === 'skip') skipped += 1;
    else ok += 1;
    process.stdout.write(`.${status}`);
  } catch (e) {
    failed.push(`${phrase.file}: ${e instanceof Error ? e.message : e}`);
    process.stdout.write('!');
  }
}
console.log(`\nGenerated ${ok}, skipped ${skipped}, failed ${failed.length} → ${outDir}`);
if (failed.length) {
  console.log('FAILED:');
  for (const f of failed) console.log('  ' + f);
  process.exit(1);
}
