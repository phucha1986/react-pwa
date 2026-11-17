// Detect chapter boundaries in the Dế Mèn narration audio (24kHz mono PCM16 WAV).
// Reads the WAV, computes RMS over short windows, and reports silence runs.
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('../tmp-demen-audio.wav', import.meta.url));
// WAV header: find 'data' chunk.
let dataOffset = 0;
for (let i = 0; i < buf.length - 4; i++) {
  if (buf[i] === 0x64 && buf[i + 1] === 0x61 && buf[i + 2] === 0x74 && buf[i + 3] === 0x61) {
    dataOffset = i + 8;
    break;
  }
}
const sr = 24000;
const samples = (buf.length - dataOffset) / 2;
const rmsWin = 0.05; // 50ms windows
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
// Silence threshold (RMS amplitude) — pick from the distribution.
const sorted = Array.from(rms).sort((a, b) => a - b);
console.log('samples:', samples, 'winCount:', winCount);
console.log(
  'rms percentiles:',
  [0.05, 0.1, 0.2, 0.5, 0.9].map((p) => `${p}: ${sorted[Math.floor(p * sorted.length)].toFixed(1)}`).join(' '),
);
const thr = sorted[Math.floor(0.08 * sorted.length)] * 1.5;
console.log('threshold:', thr.toFixed(1));
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
// Long gaps = likely paragraph/chapter boundaries.
const long = gaps.filter((g) => g.dur >= 0.6).sort((a, b) => b.dur - a.dur);
console.log('total gaps:', gaps.length);
console.log('long gaps (>=0.6s):', long.length);
console.log(long.map((g) => `${g.start.toFixed(2)}-${g.end.toFixed(2)} (${g.dur.toFixed(2)}s)`).join('\n'));
