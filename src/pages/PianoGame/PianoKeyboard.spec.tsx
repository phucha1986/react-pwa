import { cleanup, configure, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { buildKeyLayout, whiteKeyWidth } from '@/features/piano/keyboard';
import PianoKeyboard from '@/pages/PianoGame/PianoKeyboard';

// This repo uses `data-pw` as the test id attribute (see playwright.config.ts).
configure({ testIdAttribute: 'data-pw' });

// vitest runs with globals:false, so RTL auto-cleanup is not registered.
afterEach(cleanup);

describe('PianoKeyboard', () => {
  const layout = buildKeyLayout(60, 72);

  test('renders one key per MIDI note with a data-pw test id', () => {
    render(
      <PianoKeyboard
        layout={layout}
        keyWidth={44}
        pressedMidi={null}
        showNoteNames
        onTap={() => {}}
        onRelease={() => {}}
      />,
    );

    expect(screen.getByTestId('piano-keyboard')).toBeTruthy();
    expect(screen.getByTestId('piano-key-60')).toBeTruthy();
    expect(screen.getByTestId('piano-key-61')).toBeTruthy();
  });

  test('pointerdown triggers onTap with the right MIDI note', () => {
    const onTap = vi.fn();
    render(
      <PianoKeyboard
        layout={layout}
        keyWidth={44}
        pressedMidi={null}
        showNoteNames
        onTap={onTap}
        onRelease={() => {}}
      />,
    );

    fireEvent.pointerDown(screen.getByTestId('piano-key-67'), { pointerId: 1 });
    expect(onTap).toHaveBeenCalledWith(67);
  });

  test('pointerup triggers onRelease', () => {
    const onRelease = vi.fn();
    render(
      <PianoKeyboard
        layout={layout}
        keyWidth={44}
        pressedMidi={null}
        showNoteNames
        onTap={() => {}}
        onRelease={onRelease}
      />,
    );

    const key = screen.getByTestId('piano-key-60');
    fireEvent.pointerDown(key, { pointerId: 1 });
    fireEvent.pointerUp(key, { pointerId: 1 });
    expect(onRelease).toHaveBeenCalled();
  });

  test('a narrow phone width still yields a 44px touch target', () => {
    // The component relies on whiteKeyWidth, which enforces the 44px minimum.
    expect(whiteKeyWidth(320, layout.whiteCount)).toBe(44);
  });
});
