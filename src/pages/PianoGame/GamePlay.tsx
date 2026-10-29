import { useEffect, useRef, useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { accuracy } from '@/features/piano/scoring';
import { songDurationSeconds } from '@/features/piano/timing';
import type { Settings, Song } from '@/features/piano/types';
import { usePianoGame } from '@/features/piano/usePianoGame';
import { useLanguage } from '@/i18n/useLanguage';

import LandscapeStage from './LandscapeStage';
import PianoKeyboard from './PianoKeyboard';
import Stars from './Stars';
import { MUTED, NAVY_BORDER, NAVY_CARD, PURPLE, TEXT, TOUCH_TARGET } from './palette';

interface GamePlayProps {
  song: Song;
  settings: Settings;
  onHome: () => void;
  onPickSong: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const MIN_KEY_HEIGHT = 40;
const MAX_KEY_HEIGHT = 170;
/** Gap between the blocks inside the bottom half. */
const HALF_GAP = 8;
/** Below this stage height the mode hint is dropped so the keys keep their space. */
const MIN_STAGE_FOR_HINT = 360;

/**
 * Measure an element's layout height. `offsetHeight` is used instead of
 * `getBoundingClientRect` because the stage can be rotated, and the bounding
 * box of a rotated element reports swapped dimensions.
 */
function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, height };
}

export default function GamePlay({ song, settings, onHome, onPickSong }: GamePlayProps) {
  const { t } = useLanguage();
  const game = usePianoGame(song, settings);
  const stageBox = useMeasuredHeight<HTMLDivElement>();
  const bottomHalf = useMeasuredHeight<HTMLDivElement>();
  const bottomChrome = useMeasuredHeight<HTMLDivElement>();

  // Each half gets exactly half the stage, so the key bed is whatever the bottom
  // half has left after the buttons and the hint line.
  const spaceLeft = bottomHalf.height - bottomChrome.height - HALF_GAP;
  const keyHeight = Math.min(MAX_KEY_HEIGHT, Math.max(MIN_KEY_HEIGHT, spaceLeft));
  const showHint = stageBox.height >= MIN_STAGE_FOR_HINT;

  // On a short stage the key bed takes whatever is left instead of its minimum,
  // so the bottom half never spills past the stage.
  const bedHeight = Math.min(keyHeight, Math.max(24, spaceLeft));

  const reduced = prefersReducedMotion();
  const totalSeconds = songDurationSeconds(song, settings.tempoFactor);
  const progressPct =
    totalSeconds > 0 ? Math.min(100, (game.elapsedSeconds / totalSeconds) * 100) : 0;

  const modeHint =
    settings.difficultyMode === 'easy'
      ? t.pianoModeEasyHint
      : settings.difficultyMode === 'medium'
        ? t.pianoModeMediumHint
        : t.pianoModeChallengeHint;

  return (
    <LandscapeStage height="calc(100vh - 108px)">
      <Box
        ref={stageBox.ref}
        data-pw="piano-gameplay"
        sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: `${HALF_GAP}px` }}
      >
        {/* ---- top half: the falling notes ---- */}
        <Box
          data-pw="piano-notes-half"
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h6" fontWeight={800} noWrap>
              {t[song.titleKey]}
            </Typography>
            <Box data-pw="piano-score" sx={{ fontWeight: 700, color: TEXT }}>
              {t.pianoScore}: {game.score.correct}
            </Box>
          </Stack>

          <Box
            data-pw="piano-progress-bar"
            sx={{ height: 6, borderRadius: 3, background: NAVY_BORDER }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progressPct}%`,
                borderRadius: 3,
                background: PURPLE,
                transition: reduced ? 'none' : 'width 200ms linear',
              }}
            />
          </Box>

          <Box
            data-pw="piano-canvas"
            sx={{
              position: 'relative',
              flex: 1,
              minHeight: 60,
              borderRadius: 12,
              overflow: 'hidden',
              border: `1px solid ${NAVY_BORDER}`,
            }}
          >
            <canvas
              ref={game.canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {game.phase === 'idle' ? (
              <Stack
                data-pw="piano-start-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(20,26,46,0.72)',
                }}
              >
                <Button
                  data-pw="piano-start"
                  variant="contained"
                  size="large"
                  onClick={game.start}
                  sx={{
                    ...TOUCH_TARGET,
                    bgcolor: PURPLE,
                    color: '#fff',
                    borderRadius: 999,
                    fontWeight: 800,
                    px: 3,
                    textTransform: 'none',
                  }}
                >
                  {t.pianoTapToStart}
                </Button>
              </Stack>
            ) : null}

            {game.phase === 'paused' ? (
              <Stack
                data-pw="piano-paused-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(20,26,46,0.72)',
                }}
              >
                <Button
                  data-pw="piano-resume"
                  variant="contained"
                  size="large"
                  onClick={game.resume}
                  sx={{
                    ...TOUCH_TARGET,
                    bgcolor: PURPLE,
                    color: '#fff',
                    borderRadius: 999,
                    fontWeight: 800,
                    px: 3,
                    textTransform: 'none',
                  }}
                >
                  {t.pianoResume}
                </Button>
              </Stack>
            ) : null}
          </Box>
        </Box>

        {/* ---- bottom half: the buttons and the keys ---- */}
        <Box
          ref={bottomHalf.ref}
          data-pw="piano-controls-half"
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${HALF_GAP}px`,
          }}
        >
          <Box ref={bottomChrome.ref} data-pw="piano-controls">
            {game.phase === 'finished' ? (
              <Stack
                data-pw="piano-results"
                spacing={1}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 16,
                  background: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ color: TEXT }}>
                  {t.pianoResultsTitle}
                </Typography>
                <Typography variant="body1" sx={{ color: MUTED }}>
                  {game.stars >= 3 ? t.pianoCongrats : t.pianoGoodTry}
                </Typography>
                <Stars count={game.stars} size={26} />
                <Typography variant="body2">
                  {t.pianoCorrect}: {game.score.correct} / {game.score.total} · {t.pianoAccuracy}:{' '}
                  {Math.round(accuracy(game.score) * 100)}% · {t.pianoMissed}: {game.score.missed}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  <Button
                    data-pw="piano-replay"
                    variant="contained"
                    size="large"
                    onClick={game.restart}
                    sx={{
                      ...TOUCH_TARGET,
                      bgcolor: PURPLE,
                      color: '#fff',
                      borderRadius: 999,
                      fontWeight: 800,
                      textTransform: 'none',
                    }}
                  >
                    {t.pianoReplay}
                  </Button>
                  <Button
                    data-pw="piano-next-song"
                    variant="text"
                    size="large"
                    onClick={onPickSong}
                    sx={{
                      ...TOUCH_TARGET,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: TEXT,
                      borderRadius: 999,
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    {t.pianoNextSong}
                  </Button>
                </Stack>
              </Stack>
            ) : null}

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button
                data-pw="piano-pause"
                size="large"
                variant="text"
                onClick={game.pause}
                disabled={game.phase !== 'running'}
                sx={{
                  ...TOUCH_TARGET,
                  bgcolor: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                  color: TEXT,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t.pianoPause}
              </Button>
              <Button
                data-pw="piano-restart"
                size="large"
                variant="text"
                onClick={game.restart}
                disabled={game.phase === 'idle'}
                sx={{
                  ...TOUCH_TARGET,
                  bgcolor: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                  color: TEXT,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t.pianoRestart}
              </Button>
              <Button
                data-pw="piano-home"
                size="large"
                variant="text"
                onClick={onHome}
                sx={{
                  ...TOUCH_TARGET,
                  bgcolor: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                  color: TEXT,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t.pianoBack}
              </Button>
            </Stack>

            {showHint ? (
              <Typography data-pw="piano-mode-hint" variant="body2" color="text.secondary">
                {modeHint}
              </Typography>
            ) : null}
          </Box>

          <PianoKeyboard
            layout={game.keyLayout}
            keyWidth={game.keyWidth}
            pressedMidi={game.pressedMidi}
            showNoteNames={settings.showNoteNames}
            onTap={game.tap}
            onRelease={game.release}
            height={bedHeight}
          />
        </Box>
      </Box>
    </LandscapeStage>
  );
}
