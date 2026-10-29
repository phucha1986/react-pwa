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
  const speed = fallSpeedPxPerSecond(difficulty, layout.targetY);
  const secondsUntilTarget = note.startBeat * secondsPerBeat - elapsedSeconds;
  return layout.targetY - secondsUntilTarget * speed;
}

/**
 * Note height in px, proportional to its duration in beats.
 *
 * A note can never be taller than the distance it travels while it sounds,
 * otherwise the next note in the same lane would overlap it and a child could
 * not tell the notes apart. Slower falling therefore means shorter bars, with a
 * gap left between neighbours so each note stays visually separable.
 */
export function noteHeight(
  note: SongNote,
  layout: CanvasLayout,
  difficulty: Difficulty,
  secondsPerBeat: number,
): number {
  const travel =
    note.durationBeats * fallSpeedPxPerSecond(difficulty, layout.targetY) * secondsPerBeat;
  const gap = Math.max(2, travel * 0.25);
  return Math.max(
    8,
    Math.min(Math.round(note.durationBeats * layout.pxPerBeat), Math.round(travel - gap)),
  );
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
