import { describe, expect, test } from 'vitest';

import { buildKeyLayout, laneInfo, whiteKeyWidth } from './keyboard';

describe('keyboard layout', () => {
  test('C4..C5 has 8 white keys and 5 black keys', () => {
    const layout = buildKeyLayout(60, 72);
    expect(layout.whiteCount).toBe(8);
    expect(layout.whiteKeys.map((k) => k.midi)).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
    expect(layout.blackKeys.map((k) => k.midi)).toEqual([61, 63, 66, 68, 70]);
  });

  test('white key width keeps a 44px touch minimum', () => {
    expect(whiteKeyWidth(320, 8)).toBe(44);
    expect(whiteKeyWidth(800, 8)).toBe(100);
  });

  test('lane info maps white notes to their column', () => {
    const layout = buildKeyLayout(60, 72);
    expect(laneInfo(layout, 60)).toEqual({ whiteIndex: 0, blackRatio: null });
    expect(laneInfo(layout, 67)).toEqual({ whiteIndex: 4, blackRatio: null });
  });

  test('black notes use the tuned ratio over the preceding white key', () => {
    const layout = buildKeyLayout(60, 72);
    const csharp = laneInfo(layout, 61);
    expect(csharp.whiteIndex).toBe(0);
    expect(csharp.blackRatio).toBeCloseTo(0.62, 2);
  });
});
