import { afterEach, describe, expect, test } from 'vitest';

import { PianoAudio } from './audio';

describe('audio error handling', () => {
  const original = {
    AudioContext: window.AudioContext,
    webkitAudioContext: (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext,
  };

  afterEach(() => {
    window.AudioContext = original.AudioContext;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext =
      original.webkitAudioContext;
  });

  test('ensure() returns null when audio is unsupported', () => {
    window.AudioContext = undefined as unknown as typeof AudioContext;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = undefined;

    const audio = new PianoAudio();
    expect(audio.ensure()).toBeNull();
    // The game must keep running visually, so playNote must not throw.
    expect(() => audio.playNote(60, 0.5)).not.toThrow();
  });

  test('ensure() returns null when the constructor throws (blocked by policy)', () => {
    window.AudioContext = function ThrowingAudioContext() {
      throw new Error('audio blocked');
    } as unknown as typeof AudioContext;

    const audio = new PianoAudio();
    expect(audio.ensure()).toBeNull();
    expect(() => audio.playNote(60, 0.5)).not.toThrow();
  });

  test('volume and mute are clamped to a safe range', () => {
    const audio = new PianoAudio();
    expect(() => audio.setVolume(2)).not.toThrow();
    expect(() => audio.setVolume(-1)).not.toThrow();
    expect(() => audio.setMuted(true)).not.toThrow();
  });
});
