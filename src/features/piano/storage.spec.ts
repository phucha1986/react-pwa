import { beforeEach, describe, expect, test } from 'vitest';

import {
  DEFAULT_SETTINGS,
  PROGRESS_KEY,
  SETTINGS_KEY,
  loadProgress,
  loadSettings,
  recordCompletion,
  saveSettings,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loadSettings returns defaults when empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('saveSettings round-trips', () => {
    const s = { ...DEFAULT_SETTINGS, volume: 0.3, muted: true };
    expect(saveSettings(s)).toBe(true);
    expect(loadSettings()).toEqual(s);
  });

  test('loadProgress returns empty object when empty', () => {
    expect(loadProgress()).toEqual({});
  });

  test('recordCompletion keeps best stars/accuracy and counts completions', () => {
    let p = loadProgress();
    p = recordCompletion(p, 'twinkle', 2, 0.7);
    p = recordCompletion(p, 'twinkle', 3, 0.95);
    p = recordCompletion(p, 'twinkle', 1, 0.5); // worse run must not lower best
    expect(p.twinkle.stars).toBe(3);
    expect(p.twinkle.bestAccuracy).toBeCloseTo(0.95, 6);
    expect(p.twinkle.completions).toBe(3);
  });

  test('persisted progress survives a reload (read back from storage)', () => {
    recordCompletion(loadProgress(), 'twinkle', 3, 0.9);
    const reread = loadProgress();
    expect(reread.twinkle.stars).toBe(3);
    expect(localStorage.getItem(PROGRESS_KEY)).not.toBeNull();
  });

  test('corrupt JSON falls back safely instead of throwing', () => {
    localStorage.setItem(SETTINGS_KEY, 'not-json{');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    localStorage.setItem(PROGRESS_KEY, '[[broken');
    expect(loadProgress()).toEqual({});
  });
});
