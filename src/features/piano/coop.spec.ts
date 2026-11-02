import { describe, expect, test } from 'vitest';

import {
  COOP_COUNTDOWN_SECONDS,
  COOP_GUEST_RANGE,
  COOP_HOST_RANGE,
  coopKeyLayout,
  coopRange,
  decodeCoopCode,
  encodeCoopCode,
  inCoopRange,
  noteSide,
  songForSide,
} from './coop';
import { buildKeyLayout } from './keyboard';
import type { Song } from './types';

describe('co-op pitch split', () => {
  test('host owns the lower register, guest the upper', () => {
    expect(COOP_HOST_RANGE).toEqual({ low: 60, high: 65 });
    expect(COOP_GUEST_RANGE).toEqual({ low: 66, high: 72 });
  });

  test('every pitch in C4..C5 belongs to exactly one side', () => {
    for (let midi = 60; midi <= 72; midi += 1) {
      const host = inCoopRange(midi, 'host');
      const guest = inCoopRange(midi, 'guest');
      expect(host !== guest).toBe(true);
      expect(noteSide({ midi, startBeat: 0, durationBeats: 1 })).toBe(host ? 'host' : 'guest');
    }
  });

  test('each side renders only its own keys', () => {
    const host = coopKeyLayout('host');
    const guest = coopKeyLayout('guest');
    expect(host.whiteKeys.map((k) => k.midi)).toEqual([60, 62, 64, 65]);
    expect(guest.whiteKeys.map((k) => k.midi)).toEqual([67, 69, 71, 72]);
    expect(host.whiteCount + guest.whiteCount).toBe(buildKeyLayout(60, 72).whiteCount);
  });

  test('songForSide keeps only the notes that side must play', () => {
    const song: Song = {
      id: 'demo',
      titleKey: 'songTwinkleTwinkle',
      bpm: 100,
      timeSignature: { beats: 4, unit: 4 },
      difficulty: 'easy',
      introBeats: 2,
      notes: [
        { midi: 60, startBeat: 2, durationBeats: 1 },
        { midi: 67, startBeat: 3, durationBeats: 1 },
        { midi: 72, startBeat: 4, durationBeats: 1 },
      ],
    };
    const host = songForSide(song, 'host');
    const guest = songForSide(song, 'guest');
    expect(host.notes.map((note) => note.midi)).toEqual([60]);
    expect(guest.notes.map((note) => note.midi)).toEqual([67, 72]);
    expect(host.notes.length + guest.notes.length).toBe(song.notes.length);
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
    expect(coopRange('host')).toEqual(COOP_HOST_RANGE);
    expect(coopKeyLayout('guest')).toEqual(buildKeyLayout(66, 72));
  });
});
