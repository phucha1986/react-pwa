// Map the Dế Mèn narration paragraphs to audio chapter boundaries.
// The narration job (21f866c73554) is one 289.96s clip; paragraph breaks show up
// as silence gaps. We estimate each paragraph's expected end time from a uniform
// chars/second rate and snap it to the nearest detected gap.
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
if (start !== null) gaps.push({ start: start * rmsWin, end: winCount * rmsWin, dur: (winCount - start) * rmsWin });
const candidates = gaps.filter((g) => g.dur >= 0.55);

// Paragraph lengths from the narration text (tmp-demen-text.txt), in order.
const text = readFileSync(new URL('../tmp-demen-text.txt', import.meta.url), 'utf8');
const paras = text.split(/\r?\n/).filter((p) => p.trim().length > 0);
const lens = paras.map((p) => p.length);
const totalChars = lens.reduce((a, b) => a + b, 0);
const rate = total / totalChars;

let cum = 0;
const boundaries = [];
const used = new Set();
for (let i = 0; i < lens.length - 1; i++) {
  cum += lens[i];
  const expected = cum * rate;
  let best = null;
  let bestDist = Infinity;
  for (const g of candidates) {
    if (used.has(g)) continue;
    const mid = (g.start + g.end) / 2;
    const d = Math.abs(mid - expected);
    if (d < bestDist) {
      bestDist = d;
      best = g;
    }
  }
  if (best) {
    used.add(best);
    boundaries.push({ afterPara: i + 1, expected: +expected.toFixed(2), gapStart: +best.start.toFixed(2), gapEnd: +best.end.toFixed(2), err: +bestDist.toFixed(2) });
  }
}
console.log('paragraphs:', paras.length, 'rate s/char:', rate.toFixed(4));
console.log(JSON.stringify(boundaries, null, 2));
console.log('chapter ranges (start,end):');
let prev = 0;
for (const b of boundaries) {
  console.log(`  chapter ${prev.toFixed(2)}-${b.gapStart.toFixed(2)}`);
  prev = b.gapStart;
}
console.log(`  chapter ${prev.toFixed(2)}-${total.toFixed(2)}`);
