import type { Score } from './types';

export function emptyScore(total: number): Score {
  return { correct: 0, incorrect: 0, missed: 0, total };
}

export function accuracy(score: Score): number {
  if (score.total === 0) return 0;
  return score.correct / score.total;
}

/**
 * Stars are encouraging, not punitive: 3 for a clean run, 2 for most notes,
 * 1 for simply finishing. Wrong taps never remove stars.
 */
export function starsForScore(score: Score): number {
  const acc = accuracy(score);
  if (acc >= 0.9) return 3;
  if (acc >= 0.6) return 2;
  return 1;
}
