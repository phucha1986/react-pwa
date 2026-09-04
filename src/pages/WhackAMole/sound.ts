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

/** Cheerful "boing" when the rabbit is whacked. */
export function playWhack() {
  const ac = getCtx();
  const now = ac.currentTime;

  // Quick soft "pop" at the start.
  const popGain = ac.createGain();
  popGain.gain.setValueAtTime(0.0001, now);
  popGain.gain.exponentialRampToValueAtTime(0.2, now + 0.008);
  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  popGain.connect(ac.destination);
  const pop = ac.createOscillator();
  pop.type = 'sine';
  pop.frequency.setValueAtTime(520, now);
  pop.connect(popGain);
  pop.start(now);
  pop.stop(now + 0.1);

  // Rising "boing" sweep.
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  gain.connect(ac.destination);
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now + 0.02);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.3);
  osc.connect(gain);
  osc.start(now + 0.02);
  osc.stop(now + 0.35);
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
