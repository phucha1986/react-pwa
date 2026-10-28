import { Box, Button, Stack, Typography } from '@mui/material';

import { accuracy } from '@/features/piano/scoring';
import { songDurationSeconds } from '@/features/piano/timing';
import type { Settings, Song } from '@/features/piano/types';
import { usePianoGame } from '@/features/piano/usePianoGame';
import { useLanguage } from '@/i18n/useLanguage';

import PianoKeyboard from './PianoKeyboard';
import Stars from './Stars';

interface GamePlayProps {
  song: Song;
  settings: Settings;
  onHome: () => void;
  onPickSong: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function GamePlay({ song, settings, onHome, onPickSong }: GamePlayProps) {
  const { t } = useLanguage();
  const game = usePianoGame(song, settings);

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
    <Stack data-pw="piano-gameplay" spacing={1} sx={{ gap: 8 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h6" noWrap>
          {t[song.titleKey]}
        </Typography>
        <Box data-pw="piano-score" sx={{ fontWeight: 700 }}>
          {t.pianoScore}: {game.score.correct}
        </Box>
      </Stack>

      <Box data-pw="piano-progress-bar" sx={{ height: 6, borderRadius: 3, background: '#e0e0e0' }}>
        <Box
          sx={{
            height: '100%',
            width: `${progressPct}%`,
            borderRadius: 3,
            background: '#3E63DD',
            transition: reduced ? 'none' : 'width 200ms linear',
          }}
        />
      </Box>

      <Box
        data-pw="piano-canvas"
        sx={{
          position: 'relative',
          width: '100%',
          height: 'min(46vh, 320px)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        <canvas ref={game.canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {game.phase === 'idle' ? (
          <Stack
            data-pw="piano-start-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.85)',
            }}
          >
            <Button data-pw="piano-start" variant="contained" size="large" onClick={game.start}>
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
              background: 'rgba(255,255,255,0.85)',
            }}
          >
            <Button data-pw="piano-resume" variant="contained" size="large" onClick={game.resume}>
              {t.pianoResume}
            </Button>
          </Stack>
        ) : null}
      </Box>

      {game.phase === 'finished' ? (
        <Stack
          data-pw="piano-results"
          spacing={1}
          sx={{ textAlign: 'center', p: 2, borderRadius: 12, background: '#F1F5F9' }}
        >
          <Typography variant="h6">{t.pianoResultsTitle}</Typography>
          <Typography variant="body1">
            {game.stars >= 3 ? t.pianoCongrats : t.pianoGoodTry}
          </Typography>
          <Stars count={game.stars} size={26} />
          <Typography variant="body2">
            {t.pianoCorrect}: {game.score.correct} / {game.score.total} · {t.pianoAccuracy}:{' '}
            {Math.round(accuracy(game.score) * 100)}% · {t.pianoMissed}: {game.score.missed}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button data-pw="piano-replay" variant="contained" size="large" onClick={game.restart}>
              {t.pianoReplay}
            </Button>
            <Button data-pw="piano-next-song" variant="outlined" size="large" onClick={onPickSong}>
              {t.pianoNextSong}
            </Button>
          </Stack>
        </Stack>
      ) : null}

      <Stack direction="row" spacing={1}>
        <Button
          data-pw="piano-pause"
          size="large"
          onClick={game.pause}
          disabled={game.phase !== 'running'}
        >
          {t.pianoPause}
        </Button>
        <Button
          data-pw="piano-restart"
          size="large"
          onClick={game.restart}
          disabled={game.phase === 'idle'}
        >
          {t.pianoRestart}
        </Button>
        <Button data-pw="piano-home" size="large" onClick={onHome}>
          {t.pianoBack}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {modeHint}
      </Typography>

      <PianoKeyboard
        layout={game.keyLayout}
        keyWidth={game.keyWidth}
        pressedMidi={game.pressedMidi}
        showNoteNames={settings.showNoteNames}
        onTap={game.tap}
        onRelease={game.release}
      />
    </Stack>
  );
}
