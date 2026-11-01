let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  endFreq?: number,
  vol = 0.2,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + duration);
  }
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
};

/** Filtered noise burst — the arcade "boom" for an explosion. */
const playNoise = (ctx: AudioContext, start: number, duration: number, vol = 0.25) => {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime + start);
};

/** Pew for the player's shot. */
export const playShotSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 900, 0, 0.08, 'square', 300, 0.12);
  } catch {
    /* audio not available */
  }
};

/** Lower, distant pop for an enemy shot. */
export const playEnemyShotSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 320, 0, 0.09, 'sawtooth', 180, 0.08);
  } catch {
    /* audio not available */
  }
};

/** Explosion: noise boom plus a descending thump. */
export const playExplosionSound = (kind: 'enemy' | 'player') => {
  try {
    const ctx = getCtx();
    playNoise(ctx, 0, kind === 'player' ? 0.45 : 0.3, kind === 'player' ? 0.3 : 0.22);
    playTone(ctx, kind === 'player' ? 180 : 260, 0, 0.3, 'triangle', 60, 0.18);
  } catch {
    /* audio not available */
  }
};

/** Rising chime for a perfect formation bonus. */
export const playBonusSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 660, 0, 0.12, 'triangle');
    playTone(ctx, 880, 0.12, 0.12, 'triangle');
    playTone(ctx, 1320, 0.24, 0.24, 'triangle');
  } catch {
    /* audio not available */
  }
};

/** Bomb: a wide whoosh. */
export const playBombSound = () => {
  try {
    const ctx = getCtx();
    playNoise(ctx, 0, 0.5, 0.3);
    playTone(ctx, 120, 0, 0.5, 'sine', 40, 0.2);
  } catch {
    /* audio not available */
  }
};

/** Descending three-note motif for game over. */
export const playGameOverSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 440, 0, 0.22, 'square', 330, 0.16);
    playTone(ctx, 330, 0.22, 0.22, 'square', 220, 0.16);
    playTone(ctx, 220, 0.44, 0.4, 'square', 110, 0.16);
  } catch {
    /* audio not available */
  }
};
