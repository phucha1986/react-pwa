let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

// Harmonic partials (multiplier, relative amplitude) approximating a piano's
// inharmonic-ish spectrum. Higher partials decay faster, which is what makes
// a piano sound "bright at the strike, warm as it rings out".
const PARTIALS: Array<[number, number, number]> = [
  [1, 1.0, 1.6],
  [2, 0.42, 1.1],
  [3, 0.22, 0.7],
  [4, 0.12, 0.5],
  [5, 0.07, 0.35],
  [6, 0.04, 0.25],
];

/** Plays a richer, piano-like tone for the given frequency. */
export function playNote(freq: number) {
  const ac = getCtx();
  const now = ac.currentTime;
  const duration = 1.8;

  // Master envelope: fast attack, long exponential decay like a struck string.
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Brightness sweep: the filter opens on the strike and closes as the note
  // decays, mimicking the way piano overtones die away.
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.6;
  const cutoff = Math.min(freq * 10, 9000);
  filter.frequency.setValueAtTime(cutoff, now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2.5, 400), now + duration);
  filter.connect(master);
  master.connect(ac.destination);

  // Layered sine partials with slight detune for a fuller, warmer body.
  const oscs: OscillatorNode[] = [];
  for (const [mult, amp, decay] of PARTIALS) {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    osc.detune.value = (Math.random() - 0.5) * 4; // subtle chorus-like spread

    const g = ac.createGain();
    g.gain.setValueAtTime(amp, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(g);
    g.connect(filter);

    osc.start(now);
    osc.stop(now + duration);
    oscs.push(osc);
  }

  // Hammer transient: a short burst of filtered noise for the "strike".
  const noiseLen = 0.04;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * noiseLen), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = Math.min(freq * 3, 6000);
  noiseFilter.Q.value = 1.2;
  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.12, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseLen);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
}
