// Find the time inside narration paragraph 9 where the Chapter 6 story begins
// ("Một buổi chiều tối đậm, tôi gặp Dế Trũi..."), so the Chapter 4 / Chapter 6
// buttons can split that paragraph. Same gap-detection as demen-boundaries.mjs.
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('../tmp-demen-audio.wav', import.meta.url));
let dataOffset = 0;
for (let i = 0; i < buf.length - 4; i++) {
  if (buf[i] === 0x64 && buf[i + 1] === 0x61 && buf[i + 2] === 0x74 && buf[i + 3] === 0x61) {
    dataOffset = i + 8;
    break;
  }
}
const sr = 24000;
const samples = (buf.length - dataOffset) / 2;
const total = samples / sr;
const rmsWin = 0.05;
const winSamples = Math.floor(sr * rmsWin);
const winCount = Math.floor(samples / winSamples);
const rms = new Float64Array(winCount);
for (let w = 0; w < winCount; w++) {
  let sum = 0;
  const base = dataOffset + w * winSamples * 2;
  for (let s = 0; s < winSamples; s++) {
    const v = buf.readInt16LE(base + s * 2);
    sum += v * v;
  }
  rms[w] = Math.sqrt(sum / winSamples);
}
const sorted = Array.from(rms).sort((a, b) => a - b);
const thr = sorted[Math.floor(0.08 * sorted.length)] * 1.5;
const gaps = [];
let start = null;
for (let w = 0; w < winCount; w++) {
  if (rms[w] < thr) {
    if (start === null) start = w;
  } else if (start !== null) {
    gaps.push({ start: start * rmsWin, end: w * rmsWin, dur: (w - start) * rmsWin });
    start = null;
  }
}
if (start !== null)
  gaps.push({ start: start * rmsWin, end: winCount * rmsWin, dur: (winCount - start) * rmsWin });
const candidates = gaps.filter((g) => g.dur >= 0.55);

const job = JSON.parse(readFileSync(new URL('../tmp-job-demen.json', import.meta.url), 'utf8'));
const paras = job.text.split(/\r?\n/).filter((p) => p.trim().length > 0);

// Paragraph 9 (index 9) mixes Chapter 4 (the two brothers) and Chapter 6 (Dế Trũi).
const para9 = paras[9];
const splitIdx = para9.indexOf('Một buổi chiều bờ đầm');
if (splitIdx === -1) throw new Error('split sentence not found');
// Paragraph 9 is known to span the verified boundaries 225.0s..260.5s, so use
// its own chars/second rate to locate the Chapter 6 sentence inside it.
const para9Start = 225.0;
const para9End = 260.5;
const rate = (para9End - para9Start) / para9.length;
const expected = para9Start + splitIdx * rate;

let best = null;
let bestDist = Infinity;
for (const g of gaps) {
  const d = Math.abs(g.end - expected);
  if (d < bestDist) {
    bestDist = d;
    best = g;
  }
}
console.log('para9 length:', para9.length, 'splitIdx:', splitIdx, 'rate:', rate.toFixed(4));
console.log('expected split time:', expected.toFixed(2));
console.log('nearest gap:', JSON.stringify(best), 'err:', bestDist.toFixed(2));
console.log(`Chapter 4: 225.0-${best.start.toFixed(2)}  Chapter 6: ${best.end.toFixed(2)}-260.5`);
