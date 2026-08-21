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

/** Plays a short piano-like tone for the given frequency. */
export function playNote(freq: number) {
  const ac = getCtx();
  const now = ac.currentTime;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
  gain.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);

  // Soft octave harmonic for a warmer, piano-like timbre.
  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2;
  const gain2 = ac.createGain();
  gain2.gain.value = 0.12;
  osc2.connect(gain2);
  gain2.connect(gain);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 1.2);
  osc2.stop(now + 1.2);
}
