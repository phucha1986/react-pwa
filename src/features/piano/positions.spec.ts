import { describe, expect, test } from 'vitest';

import { laneCenter, noteHeight, noteY } from './positions';
import type { CanvasLayout } from './positions';
import { fallSpeedPxPerSecond } from './timing';

const layout: CanvasLayout = { width: 320, height: 300, targetY: 240, pxPerBeat: 40 };

describe('note positions', () => {
  test('a note is exactly on the target line when its time is reached', () => {
    const note = { midi: 60, startBeat: 2, durationBeats: 1 };
    const spb = 0.6; // 100 bpm
    // elapsed == startBeat * spb -> secondsUntilTarget == 0 -> y == targetY
    expect(noteY(note, 2 * spb, layout, 'easy', spb)).toBeCloseTo(layout.targetY, 6);
  });

  test('a future note is above the target line (smaller y)', () => {
    const note = { midi: 60, startBeat: 4, durationBeats: 1 };
    const spb = 0.6;
    const y = noteY(note, 0, layout, 'easy', spb);
    expect(y).toBeLessThan(layout.targetY);
  });

  test('harder difficulty falls faster (larger distance from line for the same lead)', () => {
    const note = { midi: 60, startBeat: 4, durationBeats: 1 };
    const spb = 0.6;
    const easy = noteY(note, 0, layout, 'easy', spb);
    const challenge = noteY(note, 0, layout, 'challenge', spb);
    // Both are above the line; challenge is further up (smaller y).
    expect(challenge).toBeLessThan(easy);
  });

  test('note height scales with duration', () => {
    const spb = 0.6; // 100 bpm
    // easy: 240 px runway / 4.5 s lead = 53.333 px/s, so a note travels
    // 53.333 * 0.6 = 32 px per beat, and a quarter of that is kept as the gap
    // between neighbouring notes in the same lane.
    expect(noteHeight({ midi: 60, startBeat: 2, durationBeats: 2 }, layout, 'easy', spb)).toBe(48);
    expect(noteHeight({ midi: 60, startBeat: 2, durationBeats: 1 }, layout, 'easy', spb)).toBe(24);
  });

  test('a note is never taller than the distance it travels while it sounds', () => {
    const spb = 0.6;
    const travel = 3 * fallSpeedPxPerSecond('easy', layout.targetY) * spb;
    expect(
      noteHeight({ midi: 60, startBeat: 2, durationBeats: 3 }, layout, 'easy', spb),
    ).toBeLessThanOrEqual(Math.round(travel - 2));
  });

  test('lane centre aligns white notes to their column centre', () => {
    expect(laneCenter(0, null, 44, 0)).toBe(22);
    expect(laneCenter(4, null, 44, 0)).toBe(4 * 44 + 22);
  });

  test('black note lane uses its tuned ratio', () => {
    expect(laneCenter(0, 0.62, 44, 0)).toBeCloseTo(27.28, 2);
  });
});
