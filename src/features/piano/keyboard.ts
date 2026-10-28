import { isBlackKey } from './midi';

export interface WhiteKey {
  midi: number;
  /** 0-based position among the visible white keys. */
  index: number;
}

export interface BlackKey {
  midi: number;
  /** Index of the white key the black key sits on top of. */
  index: number;
  /** Horizontal centre of the black key as a fraction of a white key width. */
  ratio: number;
}

export interface KeyLayout {
  whiteKeys: WhiteKey[];
  blackKeys: BlackKey[];
  whiteCount: number;
}

/**
 * Approximate centre position of each black key relative to the white key it
 * hangs off, tuned to a real piano keyboard so lanes line up with the keys.
 */
const BLACK_KEY_RATIO: Record<number, number> = {
  1: 0.62, // C#
  3: 0.4, // D#
  6: 0.66, // F#
  8: 0.6, // G#
  10: 0.4, // A#
};

/** Build the visible keyboard for an inclusive MIDI range (e.g. C4..C5). */
export function buildKeyLayout(low: number, high: number): KeyLayout {
  const whiteKeys: WhiteKey[] = [];
  const blackKeys: BlackKey[] = [];

  for (let midi = low; midi <= high; midi += 1) {
    if (isBlackKey(midi)) {
      // A black key sits over the white key immediately before it.
      const pc = ((midi % 12) + 12) % 12;
      blackKeys.push({ midi, index: whiteKeys.length - 1, ratio: BLACK_KEY_RATIO[pc] ?? 0.5 });
    } else {
      whiteKeys.push({ midi, index: whiteKeys.length });
    }
  }

  return { whiteKeys, blackKeys, whiteCount: whiteKeys.length };
}

/**
 * White key width in px. Keeps a touch-friendly minimum and lets the keyboard
 * scroll horizontally on very small phones instead of shrinking below 44px.
 */
export function whiteKeyWidth(availableWidth: number, whiteCount: number, min = 44): number {
  if (whiteCount <= 0) return min;
  return Math.max(min, Math.floor(availableWidth / whiteCount));
}

/**
 * Lane position for a note: which white key column it belongs to, plus the
 * black-key ratio when it is a black key. Used by the canvas so falling notes
 * land exactly on the key the child must press.
 */
export function laneInfo(
  layout: KeyLayout,
  midi: number,
): { whiteIndex: number; blackRatio: number | null } {
  if (!isBlackKey(midi)) {
    const white = layout.whiteKeys.find((k) => k.midi === midi);
    return { whiteIndex: white?.index ?? 0, blackRatio: null };
  }
  const black = layout.blackKeys.find((k) => k.midi === midi);
  return { whiteIndex: black?.index ?? 0, blackRatio: black?.ratio ?? 0.5 };
}
