import type { Progress, Settings } from './types';

export const SETTINGS_KEY = 'piano-settings';
export const PROGRESS_KEY = 'piano-progress';

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.6,
  muted: false,
  tempoFactor: 1,
  difficultyMode: 'easy',
  showNoteNames: true,
  animations: true,
  autoPlayMelody: true,
};

/** Safe JSON read: private mode / disabled storage must not crash the game. */
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== 'object') return fallback;
    return { ...fallback, ...(parsed as T) };
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): Settings {
  return readJson<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): boolean {
  return writeJson(SETTINGS_KEY, settings);
}

export function loadProgress(): Progress {
  return readJson<Progress>(PROGRESS_KEY, {});
}

export function saveProgress(progress: Progress): boolean {
  return writeJson(PROGRESS_KEY, progress);
}

/** Merge a finished run into saved progress (best stars/accuracy are kept). */
export function recordCompletion(
  progress: Progress,
  songId: string,
  stars: number,
  accuracy: number,
): Progress {
  const prev = progress[songId];
  const next: Progress = {
    ...progress,
    [songId]: {
      stars: Math.max(prev?.stars ?? 0, stars),
      bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
      completions: (prev?.completions ?? 0) + 1,
      lastPlayedAt: Date.now(),
    },
  };
  saveProgress(next);
  return next;
}
