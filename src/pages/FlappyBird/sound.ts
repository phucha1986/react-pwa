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
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + duration);
  }
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
};

/** Short "whoosh" for a flap. */
export const playFlapSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 420, 0, 0.12, 'sine', 640);
  } catch {
    /* audio not available */
  }
};

/** Bright two-note chime for passing a pipe. */
export const playScoreSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 880, 0, 0.1, 'triangle');
    playTone(ctx, 1318.5, 0.09, 0.18, 'triangle');
  } catch {
    /* audio not available */
  }
};

/** Thud for a crash. */
export const playHitSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 220, 0, 0.25, 'square', 90);
  } catch {
    /* audio not available */
  }
};
