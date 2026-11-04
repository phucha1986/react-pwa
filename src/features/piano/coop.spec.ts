import { describe, expect, test } from 'vitest';

import {
  COOP_COUNTDOWN_SECONDS,
  COOP_GUEST_RANGE,
  COOP_HOST_RANGE,
  coopArrangement,
  coopCountdownLabel,
  coopRange,
  decodeCoopCode,
  encodeCoopCode,
  noteOwner,
  songForSide,
} from './coop';
import { SONGS } from './songs';
import { songDurationSeconds, songEndBeat } from './timing';
import type { Song } from './types';

const demoSong: Song = {
  id: 'demo',
  titleKey: 'songTwinkleTwinkle',
  bpm: 100,
  timeSignature: { beats: 4, unit: 4 },
  difficulty: 'easy',
  introBeats: 2,
  notes: [
    { midi: 60, startBeat: 2, durationBeats: 1 },
    { midi: 64, startBeat: 4, durationBeats: 1 },
    { midi: 67, startBeat: 8, durationBeats: 1 },
    { midi: 72, startBeat: 10, durationBeats: 1 },
  ],
};

describe('co-op two-octave split', () => {
  test('host owns the lower octave, guest the upper', () => {
    expect(COOP_HOST_RANGE).toEqual({ low: 60, high: 72 }); // C4..C5
    expect(COOP_GUEST_RANGE).toEqual({ low: 72, high: 84 }); // C5..C6
    expect(coopRange('host')).toEqual(COOP_HOST_RANGE);
    expect(coopRange('guest')).toEqual(COOP_GUEST_RANGE);
  });

  test('each side shows a full octave: 8 white + 5 black keys', () => {
    // The seam C5 (72) is shared, so side by side the two keyboards read as one
    // C4..C6 piano. Each device still has its own complete octave, never a half.
    for (const side of ['host', 'guest'] as const) {
      const { low, high } = coopRange(side);
      expect(high - low).toBe(12);
    }
  });

  test('a pitch below the seam belongs to the host, at/above to the guest', () => {
    expect(noteOwner(60)).toBe('host');
    expect(noteOwner(71)).toBe('host');
    expect(noteOwner(72)).toBe('guest');
    expect(noteOwner(84)).toBe('guest');
  });

  test('the arrangement lifts every other bar an octave', () => {
    // bars are 4 beats: bar0 (beat2) stays, bar1 (beat4) +12, bar2 (beats 8,10) stay.
    const arrangement = coopArrangement(demoSong);
    expect(arrangement.notes.map((n) => n.midi)).toEqual([60, 76, 67, 72]);
  });

  test('the arrangement is deterministic', () => {
    expect(coopArrangement(demoSong).notes).toEqual(coopArrangement(demoSong).notes);
  });

  test('songForSide keeps only the notes on that device octave', () => {
    const host = songForSide(demoSong, 'host');
    const guest = songForSide(demoSong, 'guest');
    expect(host.notes.map((note) => note.midi)).toEqual([60, 67]);
    expect(guest.notes.map((note) => note.midi)).toEqual([76, 72]);
    expect(host.notes.length + guest.notes.length).toBe(demoSong.notes.length);
  });

  test('both sides keep the full song length so they finish together', () => {
    const host = songForSide(demoSong, 'host');
    const guest = songForSide(demoSong, 'guest');
    const arrangementEnd = songEndBeat(coopArrangement(demoSong));
    expect(songEndBeat(host)).toBe(arrangementEnd);
    expect(songDurationSeconds(host, 1)).toBe(songDurationSeconds(guest, 1));
  });

  test('every real song gives both devices something to play, within C4..C6', () => {
    for (const song of SONGS) {
      const host = songForSide(song, 'host');
      const guest = songForSide(song, 'guest');
      expect(host.notes.length, song.id).toBeGreaterThan(0);
      expect(guest.notes.length, song.id).toBeGreaterThan(0);
      expect(host.notes.length + guest.notes.length, song.id).toBe(
        coopArrangement(song).notes.length,
      );
      for (const note of coopArrangement(song).notes) {
        expect(note.midi, song.id).toBeGreaterThanOrEqual(60);
        expect(note.midi, song.id).toBeLessThanOrEqual(84);
      }
    }
  });
});

describe('co-op invite code', () => {
  test('code is deterministic for a song id', () => {
    expect(encodeCoopCode('twinkle')).toBe(encodeCoopCode('twinkle'));
    expect(encodeCoopCode('twinkle')).not.toBe(encodeCoopCode('mary-lamb'));
  });

  test('code uses the unambiguous alphabet and fixed length', () => {
    const code = encodeCoopCode('twinkle');
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
  });

  test('guest resolves the host code back to the same song', () => {
    const ids = ['twinkle', 'mary-lamb', 'ode-to-joy'];
    const code = encodeCoopCode('mary-lamb');
    expect(decodeCoopCode(code, ids)).toBe('mary-lamb');
    expect(decodeCoopCode(code.toLowerCase(), ids)).toBe('mary-lamb');
    expect(decodeCoopCode('ZZZZ', ids)).toBeNull();
  });

  test('countdown constant is shared by both sides', () => {
    expect(COOP_COUNTDOWN_SECONDS).toBe(3);
    expect(coopCountdownLabel(2.4)).toBe('3');
    expect(coopCountdownLabel(0)).toBe('GO');
  });
});
