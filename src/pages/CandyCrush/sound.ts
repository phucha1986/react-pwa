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

/** Soft two-note "tick" when two candies are swapped. */
export function playSwap() {
  tone(330, 0, 0.07, 'sine', 0.16);
  tone(440, 0.06, 0.08, 'sine', 0.16);
}

/** Rising arpeggio when candies match; pitch climbs with the cascade chain. */
export function playMatch(chain: number) {
  const base = 440 + Math.min(chain, 6) * 110;
  tone(base, 0, 0.12, 'triangle', 0.26);
  tone(base * 1.25, 0.06, 0.12, 'triangle', 0.22);
  tone(base * 1.5, 0.12, 0.18, 'triangle', 0.2);
}

/** Deep rumble when a special candy detonates. */
export function playBoom() {
  tone(110, 0, 0.35, 'sawtooth', 0.3);
  tone(73.42, 0.05, 0.4, 'square', 0.22);
  tone(55, 0.1, 0.5, 'sine', 0.3);
}

/** Gentle wobble when the board is shuffled. */
export function playShuffle() {
  tone(262, 0, 0.1, 'sine', 0.2);
  tone(330, 0.08, 0.1, 'sine', 0.2);
  tone(392, 0.16, 0.14, 'sine', 0.2);
}

/** Little fanfare when the game ends with a score. */
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.1, 0.25, 'triangle', 0.3));
}

/** Descending tones when the game ends without a score. */
export function playOver() {
  tone(392, 0, 0.2, 'triangle', 0.3);
  tone(311.13, 0.18, 0.2, 'triangle', 0.3);
  tone(233.08, 0.36, 0.4, 'triangle', 0.32);
}
