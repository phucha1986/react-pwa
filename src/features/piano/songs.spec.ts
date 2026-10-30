import { describe, expect, test } from 'vitest';

import { SONGS, getSong, mergeRepeatedNotes } from './songs';

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

  test('consecutive same notes merge into one longer note', () => {
    const merged = mergeRepeatedNotes([
      { midi: 60, startBeat: 2, durationBeats: 1 },
      { midi: 60, startBeat: 3, durationBeats: 1 },
      { midi: 67, startBeat: 4, durationBeats: 1 },
    ]);
    expect(merged).toEqual([
      { midi: 60, startBeat: 2, durationBeats: 2 },
      { midi: 67, startBeat: 4, durationBeats: 1 },
    ]);
  });

  test('three or more in a row merge too, and unsorted input is handled', () => {
    const merged = mergeRepeatedNotes([
      { midi: 67, startBeat: 5, durationBeats: 1 },
      { midi: 67, startBeat: 4, durationBeats: 1 },
      { midi: 67, startBeat: 6, durationBeats: 2 },
    ]);
    expect(merged).toEqual([{ midi: 67, startBeat: 4, durationBeats: 4 }]);
  });

  test('a gap keeps the notes separate — the child has to re-strike', () => {
    const merged = mergeRepeatedNotes([
      { midi: 60, startBeat: 2, durationBeats: 1 },
      { midi: 60, startBeat: 4, durationBeats: 1 },
    ]);
    expect(merged.length).toBe(2);
  });

  test('a longer note followed immediately by the same pitch merges too', () => {
    const merged = mergeRepeatedNotes([
      { midi: 64, startBeat: 6, durationBeats: 2 },
      { midi: 64, startBeat: 8, durationBeats: 1 },
    ]);
    expect(merged).toEqual([{ midi: 64, startBeat: 6, durationBeats: 3 }]);
  });

  test('published songs contain no contiguous duplicate pitches', () => {
    for (const song of SONGS) {
      const ordered = [...song.notes].sort((a, b) => a.startBeat - b.startBeat);
      for (let i = 1; i < ordered.length; i += 1) {
        const previous = ordered[i - 1];
        const current = ordered[i];
        const contiguous = current.startBeat === previous.startBeat + previous.durationBeats;
        if (contiguous) {
          expect(current.midi).not.toBe(previous.midi);
        }
      }
    }
  });
});
