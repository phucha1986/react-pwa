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

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const ac = getCtx();
  const now = ac.currentTime + start;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

/** Short "bonk" when a mole is whacked. */
export function playWhack() {
  tone(180, 0, 0.09, 'square', 0.25);
  tone(90, 0.02, 0.12, 'sine', 0.3);
}

/** Descending tones when time runs out. */
export function playGameOver() {
  tone(392, 0, 0.2, 'triangle', 0.3);
  tone(311.13, 0.18, 0.2, 'triangle', 0.3);
  tone(233.08, 0.36, 0.4, 'triangle', 0.32);
}

/** Little fanfare when the game ends with a score. */
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.1, 0.25, 'triangle', 0.3));
}
