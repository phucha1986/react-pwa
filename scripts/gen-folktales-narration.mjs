// Regenerates the Folktales page narrations with the local voice-ai backend
// (OmniVoice, FastAPI on http://localhost:8000), cloned from the registered
// voice "Giong vo" (id ab6c7e7b7693). Override with VOICE_ID.
//
// Story texts live in scripts/narration/{story}.txt — they are the verbatim
// narration texts previously sent to the backend, recovered from git history.
// Each generated WAV is saved to public/audio/folktales/{story}.wav as a
// durable copy (the page itself streams /jobs/{id}/audio from the backend),
// and the Dế Mèn audio is also copied to tmp-demen-audio.wav so
// scripts/demen-boundaries.mjs can recompute the chapter boundaries.
//
// Re-run with --force to regenerate existing audio.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = process.env.VOICE_API_BASE ?? 'http://localhost:8000';
const VOICE_ID = process.env.VOICE_ID ?? 'ab6c7e7b7693'; // "Giong vo"
const force = process.argv.includes('--force');
const outDir = path.resolve(__dirname, '../public/audio/folktales');
const stories = ['bamboo', 'thanh-giong', 'dua-hau', 'ho-guom', 'de-men'];

await mkdir(outDir, { recursive: true });
console.log(`Folktales narration, voice: clone ${VOICE_ID}`);

async function generateOne(name, text) {
  const out = path.join(outDir, `${name}.wav`);
  if (!force) {
    try {
      const st = await readFile(out);
      if (st.length > 1000) return { status: 'skip', job: null };
    } catch {
      /* not generated yet */
    }
  }
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text,
      voice_id: VOICE_ID,
      language: 'vi',
      speed: 1,
      temperature: 0.4,
      seed: 42,
    }),
  });
  if (!res.ok) throw new Error(`generate ${res.status}: ${await res.text()}`);
  const job = await res.json();

  // Long narrations take minutes on GPU; poll up to 20 minutes.
  for (let i = 0; i < 1200; i++) {
    const r = await fetch(`${API_BASE}/jobs/${job.id}`);
    const j = await r.json();
    if (j.status === 'done') {
      const audio = await fetch(`${API_BASE}/jobs/${job.id}/audio`);
      if (!audio.ok) throw new Error(`audio ${audio.status}`);
      const wav = Buffer.from(await audio.arrayBuffer());
      await writeFile(out, wav);
      await writeFile(path.join(outDir, `${name}.txt`), text);
      if (name === 'de-men') {
        await writeFile(path.resolve(__dirname, '../tmp-demen-audio.wav'), wav);
      }
      return { status: 'ok', job: j };
    }
    if (j.status === 'failed' || j.status === 'cancelled') {
      throw new Error(`job ${job.id} ${j.status}: ${j.error ?? ''}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`job ${job.id} timed out`);
}

let ok = 0;
let skipped = 0;
const failed = [];
for (const name of stories) {
  const text = (await readFile(path.resolve(__dirname, `narration/${name}.txt`), 'utf8')).trim();
  try {
    const { status, job } = await generateOne(name, text);
    if (status === 'skip') {
      skipped++;
      console.log(`skip ${name}`);
    } else {
      ok++;
      console.log(`ok ${name}: job ${job.id}, ${job.duration_seconds}s, ${text.length} chars`);
    }
  } catch (e) {
    failed.push(name);
    console.error(`FAIL ${name}: ${e.message}`);
  }
}
console.log(`done: ${ok} generated, ${skipped} skipped, ${failed.length} failed`);
if (failed.length) process.exit(1);
