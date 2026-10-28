import { fallSpeedPxPerSecond } from './timing';
import type { Difficulty, SongNote } from './types';

export interface CanvasLayout {
  width: number;
  height: number;
  /** Y of the target line the notes must reach when the key is tapped. */
  targetY: number;
  /** Pixels per beat, used for note height. */
  pxPerBeat: number;
}

/**
 * Vertical position of a note's bottom edge for a given song time.
 * Notes fall from the top towards the target line; a note whose bottom edge is
 * on the line is exactly "now". Tempo changes scale the time, not the pitch,
 * so falling speed stays constant while notes get further apart.
 */
export function noteY(
  note: SongNote,
  elapsedSeconds: number,
  layout: CanvasLayout,
  difficulty: Difficulty,
  secondsPerBeat: number,
): number {
  const speed = fallSpeedPxPerSecond(difficulty, layout.height);
  const secondsUntilTarget = note.startBeat * secondsPerBeat - elapsedSeconds;
  return layout.targetY - secondsUntilTarget * speed;
}

/** Note height in px, proportional to its duration in beats. */
export function noteHeight(note: SongNote, layout: CanvasLayout): number {
  return Math.max(14, Math.round(note.durationBeats * layout.pxPerBeat));
}

/**
 * Horizontal centre of a note lane, aligned with the keyboard key it belongs
 * to. `whiteWidth` is the current white-key width and `whiteIndex` the position
 * of the white key the note sits on (black keys use their tuned ratio).
 */
export function laneCenter(
  whiteIndex: number,
  blackRatio: number | null,
  whiteWidth: number,
  offsetX: number,
): number {
  const base = offsetX + whiteIndex * whiteWidth;
  if (blackRatio === null) return base + whiteWidth / 2;
  return base + whiteWidth * blackRatio;
}
