import { useRef } from 'react';

import { Box } from '@mui/material';

import type { KeyLayout } from '@/features/piano/keyboard';
import { handColor, isBlackKey, noteLetter } from '@/features/piano/midi';

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
        {/* Maroon apron band across the top of the key bed, just under the
            red target line — matches the Synthesia reference look. */}
        <Box
          data-pw="piano-apron"
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: 14,
            zIndex: 1,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, #a23b3b 0%, #8b3232 100%)',
            boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.35)',
          }}
        />
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
                border: `1px solid #c2c8d4`,
                borderRadius: '0 0 6px 6px',
                background: active
                  ? handColor(key.midi)
                  : 'linear-gradient(180deg, #ffffff 0%, #eef1f6 78%, #dfe3eb 100%)',
                boxShadow: active ? `0 0 12px ${handColor(key.midi)}` : 'inset 0 -3px 4px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 0.5,
                cursor: 'pointer',
                transition: 'background 120ms ease, box-shadow 120ms ease',
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
                borderRadius: '0 0 5px 5px',
                background: active ? handColor(key.midi) : 'linear-gradient(180deg, #2b313b 0%, #171b21 100%)',
                boxShadow: active ? `0 0 12px ${handColor(key.midi)}` : 'inset 0 -2px 3px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 0.5,
                cursor: 'pointer',
                transition: 'background 120ms ease, box-shadow 120ms ease',
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
