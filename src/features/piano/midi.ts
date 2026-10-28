/**
 * MIDI helpers. MIDI note numbers are the single source of truth for pitch:
 * 60 = C4 (middle C), 69 = A4 = 440 Hz.
 */

export const A4_MIDI = 69;

/** Equal-tempered frequency for a MIDI note number. */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - A4_MIDI) / 12);
}

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Note name with octave, e.g. 60 -> "C4", 72 -> "C5". */
export function noteName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${SHARP_NAMES[pc]}${octave}`;
}

/** Short note letter only (C..B), used for the falling-note labels. */
export function noteLetter(midi: number): string {
  return SHARP_NAMES[((midi % 12) + 12) % 12];
}

export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}
