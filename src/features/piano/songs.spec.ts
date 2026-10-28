import { describe, expect, test } from 'vitest';

import { SONGS, getSong } from './songs';

describe('song data', () => {
  test('there are at least 8 songs', () => {
    expect(SONGS.length).toBeGreaterThanOrEqual(8);
  });

  test('every song is valid', () => {
    for (const song of SONGS) {
      expect(song.id).toBeTruthy();
      expect(song.notes.length).toBeGreaterThan(0);
      expect(song.bpm).toBeGreaterThan(0);
      // Notes must start at or after the intro lead-in.
      for (const note of song.notes) {
        expect(note.startBeat).toBeGreaterThanOrEqual(song.introBeats);
        expect(note.durationBeats).toBeGreaterThan(0);
        // Notes stay inside the visible C4..C5 keyboard range.
        expect(note.midi).toBeGreaterThanOrEqual(60);
        expect(note.midi).toBeLessThanOrEqual(72);
      }
    }
  });

  test('getSong resolves ids and returns undefined for unknown ids', () => {
    expect(getSong('twinkle')?.titleKey).toBe('songTwinkleTwinkle');
    expect(getSong('does-not-exist')).toBeUndefined();
  });

  test('no copyrighted song is included (Happy Birthday must be absent)', () => {
    expect(SONGS.some((s) => s.id === 'happy-birthday')).toBe(false);
  });
});
