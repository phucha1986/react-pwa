import { describe, expect, test } from 'vitest';

import type { PianoAudio } from './audio';
import { PianoGameEngine } from './engine';
import { getSong } from './songs';
import { DEFAULT_SETTINGS } from './storage';
import type { EngineEvent, Settings } from './types';

/** Minimal audio stub: the engine only needs playNote/stopAll, no real Web Audio. */
const stubAudio = {
  playNote: () => {},
  stopAll: () => {},
} as unknown as PianoAudio;

function makeEngine(songId: string, settings: Settings = DEFAULT_SETTINGS) {
  const events: EngineEvent[] = [];
  const engine = new PianoGameEngine(
    getSong(songId)!,
    () => settings,
    stubAudio,
    (e) => events.push(e),
  );
  return { engine, events };
}

describe('engine', () => {
  test('start resets score and tracked notes', () => {
    const { engine } = makeEngine('twinkle');
    engine.start(0);
    expect(engine.state.phase).toBe('running');
    expect(engine.state.score.correct).toBe(0);
    expect(engine.state.tracked.length).toBeGreaterThan(0);
    expect(engine.state.tracked.every((t) => t.status === 'pending')).toBe(true);
  });

  test('a tap inside the hit window of the right note scores correct', () => {
    const settings = { ...DEFAULT_SETTINGS, difficultyMode: 'easy' as const };
    const { engine, events } = makeEngine('twinkle', settings);
    engine.start(0);

    const first = engine.state.tracked[0].note; // startBeat 2, bpm 100 -> 1.2s
    const spb = 60 / 100;
    const atMs = first.startBeat * spb * 1000; // exactly on the note
    const result = engine.tap(first.midi, atMs);

    expect(result).toBe('correct');
    expect(engine.state.score.correct).toBe(1);
    expect(events.some((e) => e.type === 'hit')).toBe(true);
  });

  test('a tap outside any window counts as incorrect but keeps playing', () => {
    const settings = { ...DEFAULT_SETTINGS, difficultyMode: 'challenge' as const };
    const { engine, events } = makeEngine('twinkle', settings);
    engine.start(0);
    const result = engine.tap(60, 0); // way before the first note
    expect(result).toBe('incorrect');
    expect(engine.state.score.incorrect).toBe(1);
    expect(engine.state.phase).toBe('running');
    expect(events.some((e) => e.type === 'incorrect')).toBe(true);
  });

  test('notes are marked missed once the window passes', () => {
    const settings = { ...DEFAULT_SETTINGS, difficultyMode: 'easy' as const };
    const { engine, events } = makeEngine('twinkle', settings);
    engine.start(0);
    const spb = 60 / 100;
    const window = 0.9;
    // Advance past the first note's window without tapping.
    engine.tick((engine.state.tracked[0].note.startBeat * spb + window + 0.1) * 1000);
    expect(engine.state.score.missed).toBe(1);
    expect(events.some((e) => e.type === 'missed')).toBe(true);
  });

  test('pause freezes elapsed time, resume continues without drift', () => {
    const { engine } = makeEngine('twinkle');
    engine.start(0);
    engine.pause(1000);
    expect(engine.state.phase).toBe('paused');
    expect(engine.elapsed(9000)).toBeCloseTo(1, 6); // frozen
    engine.resume(9000);
    expect(engine.elapsed(10000)).toBeCloseTo(2, 6); // continues from 1s
  });

  test('finish fires once with stars when the song ends', () => {
    const settings = { ...DEFAULT_SETTINGS, difficultyMode: 'easy' as const };
    const { engine, events } = makeEngine('twinkle', settings);
    engine.start(0);
    // Tap every note exactly on time -> perfect run -> 3 stars.
    const spb = 60 / 100;
    for (const item of engine.state.tracked) {
      engine.tap(item.note.midi, item.note.startBeat * spb * 1000);
    }
    // Advance past the end to trigger finish.
    engine.tick(100000);
    expect(engine.state.phase).toBe('finished');
    const finished = events.filter((e) => e.type === 'finished');
    expect(finished.length).toBe(1);
    expect((finished[0] as { stars: number }).stars).toBe(3);
  });

  test('free play outside running phase just sounds a note', () => {
    const { engine, events } = makeEngine('twinkle');
    const result = engine.tap(60, 0);
    expect(result).toBe('free');
    expect(events.some((e) => e.type === 'free')).toBe(true);
  });
});
