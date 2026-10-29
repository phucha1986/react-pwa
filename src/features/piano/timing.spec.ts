import { describe, expect, test } from 'vitest';

import { SongClock, fallSpeedPxPerSecond, hitWindowSeconds, songDurationSeconds } from './timing';
import type { Song } from './types';

describe('song clock', () => {
  test('beat -> seconds at 100 bpm', () => {
    const clock = new SongClock(100);
    expect(clock.secondsPerBeat(1)).toBeCloseTo(0.6, 6);
    expect(clock.beatToSeconds(4, 1)).toBeCloseTo(2.4, 6);
  });

  test('tempo factor scales time without changing pitch', () => {
    const clock = new SongClock(100);
    // Half tempo => twice as long per beat.
    expect(clock.secondsPerBeat(0.5)).toBeCloseTo(1.2, 6);
  });

  test('elapsed time advances from start', () => {
    const clock = new SongClock(100);
    clock.start(1000);
    expect(clock.elapsedSeconds(2000)).toBeCloseTo(1, 6);
  });

  test('pause/resume does not drift: time is frozen while paused', () => {
    const clock = new SongClock(100);
    clock.start(0);
    clock.pause(1000); // 1s elapsed
    // A long gap while paused must not count.
    expect(clock.elapsedSeconds(5000)).toBeCloseTo(1, 6);
    clock.resume(5000);
    // Continues exactly where it stopped.
    expect(clock.elapsedSeconds(6000)).toBeCloseTo(2, 6);
  });

  test('hit windows shrink with difficulty and scale with tempo', () => {
    expect(hitWindowSeconds('easy', 1)).toBeCloseTo(0.9, 6);
    expect(hitWindowSeconds('medium', 1)).toBeCloseTo(0.6, 6);
    expect(hitWindowSeconds('challenge', 1)).toBeCloseTo(0.4, 6);
    // Slower tempo => proportionally wider window (still fair).
    expect(hitWindowSeconds('easy', 0.5)).toBeCloseTo(1.8, 6);
  });

  test('falling speed gives kids a long visible lead and slows with easier modes', () => {
    // A 300 px runway at 'easy' must keep a note on screen for ~4.5 s.
    expect(fallSpeedPxPerSecond('easy', 300)).toBeCloseTo(66.667, 3);
    expect(fallSpeedPxPerSecond('medium', 300)).toBeCloseTo(93.75, 3);
    expect(fallSpeedPxPerSecond('challenge', 300)).toBeCloseTo(136.364, 3);
    // Easier modes are always slower than harder ones.
    expect(fallSpeedPxPerSecond('easy', 300)).toBeLessThan(fallSpeedPxPerSecond('challenge', 300));
  });

  test('song duration includes intro + last note', () => {
    const song: Song = {
      id: 'x',
      titleKey: 'songTwinkleTwinkle',
      bpm: 100,
      timeSignature: { beats: 4, unit: 4 },
      difficulty: 'easy',
      introBeats: 2,
      notes: [{ midi: 60, startBeat: 2, durationBeats: 1 }],
    };
    // last beat = 3 => 3 * 0.6 = 1.8s
    expect(songDurationSeconds(song, 1)).toBeCloseTo(1.8, 6);
  });
});
