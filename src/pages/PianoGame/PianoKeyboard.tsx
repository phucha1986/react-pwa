import { useRef } from 'react';

import { Box } from '@mui/material';

import type { KeyLayout } from '@/features/piano/keyboard';
import { isBlackKey, noteLetter } from '@/features/piano/midi';

import { NAVY_BORDER } from './palette';

interface PianoKeyboardProps {
  layout: KeyLayout;
  keyWidth: number;
  pressedMidi: number | null;
  showNoteNames: boolean;
  onTap: (midi: number) => void;
  onRelease: () => void;
  /** Height of the key bed. Defaults to a kid-sized 120px; accepts any CSS length. */
  height?: number | string;
}

const KEY_HEIGHT = 120;

/**
 * Touch-friendly on-screen keyboard. Keys are at least 44px wide (the layout
 * scrolls horizontally on tiny phones rather than shrinking), pointer events
 * handle multi-touch, and `touch-action: none` prevents scroll/zoom fighting
 * the child's fingers. The key bed grows to whatever height the layout gives it.
 */
export default function PianoKeyboard({
  layout,
  keyWidth,
  pressedMidi,
  showNoteNames,
  onTap,
  onRelease,
  height = KEY_HEIGHT,
}: PianoKeyboardProps) {
  const captured = useRef(false);

  const press = (midi: number) => {
    captured.current = true;
    onTap(midi);
  };

  const release = () => {
    if (captured.current) {
      captured.current = false;
      onRelease();
    }
  };

  const totalWidth = layout.whiteCount * keyWidth;

  return (
    <Box
      data-pw="piano-keyboard"
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflowX: 'auto',
        overflowY: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <Box sx={{ position: 'relative', width: totalWidth, height }}>
        {/* White keys */}
        {layout.whiteKeys.map((key) => {
          const active = pressedMidi === key.midi;
          return (
            <Box
              key={key.midi}
              data-pw={`piano-key-${key.midi}`}
              role="button"
              aria-label={`Note ${noteLetter(key.midi)}`}
              tabIndex={-1}
              onPointerDown={(e) => {
                e.preventDefault();
                press(key.midi);
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              sx={{
                position: 'absolute',
                left: key.index * keyWidth,
                top: 0,
                width: keyWidth,
                height,
                boxSizing: 'border-box',
                border: `1px solid ${NAVY_BORDER}`,
                borderRadius: '0 0 8px 8px',
                background: active ? '#6c5ce7' : '#f7f8fb',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 0.5,
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              {showNoteNames && !isBlackKey(key.midi) ? (
                <Box
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#546e7a',
                    pointerEvents: 'none',
                  }}
                >
                  {noteLetter(key.midi)}
                </Box>
              ) : null}
            </Box>
          );
        })}

        {/* Black keys layered on top */}
        {layout.blackKeys.map((key) => {
          const active = pressedMidi === key.midi;
          return (
            <Box
              key={key.midi}
              data-pw={`piano-key-${key.midi}`}
              role="button"
              aria-label={`Note ${noteLetter(key.midi)}`}
              tabIndex={-1}
              onPointerDown={(e) => {
                e.preventDefault();
                press(key.midi);
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              sx={{
                position: 'absolute',
                left: (key.index + key.ratio) * keyWidth - keyWidth * 0.3,
                top: 0,
                width: keyWidth * 0.6,
                height: '65%',
                zIndex: 2,
                boxSizing: 'border-box',
                borderRadius: '0 0 6px 6px',
                background: active ? '#8b7cf0' : '#263238',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 0.5,
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              {showNoteNames ? (
                <Box
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#e3f2fd',
                    pointerEvents: 'none',
                  }}
                >
                  {noteLetter(key.midi)}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
