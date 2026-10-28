import { describe, expect, test } from 'vitest';

import { accuracy, emptyScore, starsForScore } from './scoring';

describe('scoring', () => {
  test('empty score', () => {
    expect(emptyScore(10)).toEqual({ correct: 0, incorrect: 0, missed: 0, total: 10 });
  });

  test('accuracy is correct / total', () => {
    const score = { correct: 8, incorrect: 2, missed: 0, total: 10 };
    expect(accuracy(score)).toBeCloseTo(0.8, 6);
  });

  test('accuracy of an empty score is 0', () => {
    expect(accuracy(emptyScore(0))).toBe(0);
  });

  test('stars: >=0.9 -> 3, >=0.6 -> 2, otherwise 1', () => {
    expect(starsForScore({ correct: 9, incorrect: 0, missed: 1, total: 10 })).toBe(3);
    expect(starsForScore({ correct: 6, incorrect: 0, missed: 4, total: 10 })).toBe(2);
    expect(starsForScore({ correct: 5, incorrect: 0, missed: 5, total: 10 })).toBe(1);
  });

  test('wrong taps never remove stars (non-punitive)', () => {
    // 9 correct of 10 targets, plus a few stray taps -> still 3 stars.
    expect(starsForScore({ correct: 9, incorrect: 3, missed: 1, total: 10 })).toBe(3);
  });
});
