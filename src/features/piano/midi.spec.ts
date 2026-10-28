import { describe, expect, test } from 'vitest';

import { isBlackKey, midiToFrequency, noteLetter, noteName } from './midi';

describe('midi utils', () => {
  test('A4 (69) is 440 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 6);
  });

  test('C4 (60) is ~261.63 Hz', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
  });

  test('one octave up doubles the frequency', () => {
    expect(midiToFrequency(81)).toBeCloseTo(midiToFrequency(69) * 2, 6);
  });

  test('note names / letters', () => {
    expect(noteName(60)).toBe('C4');
    expect(noteLetter(60)).toBe('C');
    expect(noteLetter(61)).toBe('C#');
  });

  test('black key detection', () => {
    expect(isBlackKey(61)).toBe(true); // C#
    expect(isBlackKey(60)).toBe(false); // C
    expect(isBlackKey(64)).toBe(false); // E (natural)
    expect(isBlackKey(66)).toBe(true); // F#
  });
});
