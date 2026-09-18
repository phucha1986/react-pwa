// Audio engine for the piano game.
// Builds a warm, piano-like tone from a harmonic stack with per-partial decay,
// a soft hammer-strike transient, and a generated reverb tail. Everything is
// routed through a gentle compressor so overlapping notes never clip.

type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let dry: GainNode | null = null;
let wet: GainNode | null = null;

/** Returns the shared AudioContext, creating (and resuming) it if needed. */
export function getAudioContext(): AudioContext {
  if (!ctx) {
    const AC: Ctor =
      window.AudioContext || (window as unknown as { webkitAudioContext: Ctor }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One-time master chain: dry/wet buses -> compressor (soft limiter) -> out. */
function ensureMaster(ac: AudioContext) {
  if (master) return;

  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 20;
  comp.ratio.value = 12;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;

  master = ac.createGain();
  master.gain.value = 0.85;

  dry = ac.createGain();
  dry.gain.value = 0.85;

  wet = ac.createGain();
  wet.gain.value = 0.3;

  const reverb = ac.createConvolver();
  reverb.buffer = makeImpulseResponse(ac, 2.4, 2.8);

  dry.connect(comp);
  wet.connect(reverb);
  reverb.connect(comp);
  comp.connect(master);
  master.connect(ac.destination);
}

/** Synthesizes a decaying-noise impulse response for a soft, warm reverb. */
function makeImpulseResponse(ac: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ac.sampleRate;
  const len = Math.max(1, Math.floor(rate * seconds));
  const buf = ac.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return buf;
}

/**
 * Plays a short piano-like tone for the given frequency.
 * `when` schedules the note against the audio clock (0 = now);
 * `velocity` scales the loudness (0..1).
 */
export function playNote(freq: number, when = 0, velocity = 0.9) {
  const ac = getAudioContext();
  ensureMaster(ac);
  const t0 = ac.currentTime + when;
  if (!dry || !wet) return;

  const peak = 0.4 * velocity;

  // Per-note envelope: fast piano attack, gentle sustain, exponential tail.
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  env.gain.exponentialRampToValueAtTime(peak * 0.42, t0 + 0.22);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.9);

  // Gentle lowpass so the harmonics stay warm instead of harsh.
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = Math.min(10000, freq * 9);
  lp.Q.value = 0.35;

  env.connect(lp);
  lp.connect(dry);
  lp.connect(wet);

  // Hammer strike: a tiny filtered-noise burst for the initial "thock".
  const nLen = Math.max(1, Math.floor(ac.sampleRate * 0.035));
  const nBuf = ac.createBuffer(1, nLen, ac.sampleRate);
  const nData = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nData[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
  const noise = ac.createBufferSource();
  noise.buffer = nBuf;
  const nf = ac.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = Math.min(9000, freq * 3.5);
  nf.Q.value = 0.8;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.5 * velocity, t0);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(env);

  // Harmonic stack — the heart of the piano timbre.
  // Amplitudes roll off like a real piano, and a few partials are slightly
  // detuned, which spreads them out for a richer, less synthetic sound.
  const partials: Array<[number, number, number]> = [
    [1, 1, 0],
    [2, 0.45, -3],
    [3, 0.24, 2],
    [4, 0.14, -2],
    [5, 0.09, 1],
    [6, 0.06, -1],
    [7, 0.04, 2],
    [9, 0.025, -2],
  ];

  const stopAt = t0 + 2.1;
  for (const [mult, amp, cents] of partials) {
    const f = freq * mult;
    if (f > 10000) break;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    osc.detune.value = cents;
    const g = ac.createGain();
    g.gain.value = amp;
    osc.connect(g);
    g.connect(env);
    osc.start(t0);
    osc.stop(stopAt);
  }
  noise.start(t0);
  noise.stop(t0 + 0.05);
}

/**
 * Plays a soft, sustained chord (a pad) routed through the same master/reverb
 * bus as the notes, so it shares the piano's warmth. `when` schedules the chord
 * against the audio clock (0 = now); `duration` is how long it sustains (s);
 * `velocity` scales loudness (0..1).
 *
 * Returns the created gain nodes + oscillators so the caller can fade them out
 * and disconnect them later (e.g. when auto-play stops).
 */
export function playPadChord(
  freqs: number[],
  duration = 1.8,
  when = 0,
  velocity = 0.6,
): { gains: GainNode[]; oscs: AudioScheduledSourceNode[] } {
  const ac = getAudioContext();
  ensureMaster(ac);
  const t0 = ac.currentTime + when;

  const gains: GainNode[] = [];
  const oscs: AudioScheduledSourceNode[] = [];
  const peak = 0.05 * velocity;

  for (const freq of freqs) {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.18); // gentle attack
    g.gain.setValueAtTime(peak, t0 + duration * 0.6); // sustain
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration); // release
    osc.connect(g);
    if (dry) g.connect(dry);
    if (wet) g.connect(wet);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
    gains.push(g);
    oscs.push(osc);
  }
  return { gains, oscs };
}
