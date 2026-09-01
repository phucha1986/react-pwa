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
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

/** Soft click when a card is flipped. */
export function playFlip() {
  tone(520, 0, 0.08, 'sine', 0.15);
}

/** Happy rising arpeggio when two cards match. */
export function playMatch() {
  tone(523.25, 0, 0.16, 'triangle', 0.3);
  tone(659.25, 0.1, 0.16, 'triangle', 0.3);
  tone(783.99, 0.2, 0.28, 'triangle', 0.32);
}

/** Gentle "not quite" sound when two cards don't match. */
export function playMismatch() {
  tone(320, 0, 0.14, 'sine', 0.2);
  tone(260, 0.12, 0.2, 'sine', 0.2);
}

/** Celebratory fanfare when the board is cleared. */
export function playWin() {
  const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.12, 0.32, 'triangle', 0.3));
}
