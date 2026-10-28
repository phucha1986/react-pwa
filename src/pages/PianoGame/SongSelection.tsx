import { useCallback } from 'react';

import { Box, Button, Card, Stack, Typography } from '@mui/material';

import { pianoAudio } from '@/features/piano/audio';
import { SONGS } from '@/features/piano/songs';
import { loadProgress } from '@/features/piano/storage';
import type { Settings, Song } from '@/features/piano/types';
import { useLanguage } from '@/i18n/useLanguage';

import Stars from './Stars';

interface SongSelectionProps {
  settings: Settings;
  onPick: (songId: string) => void;
  onBack: () => void;
}

/** Play the opening phrase of a song so a child can recognise it. */
function previewSong(song: Song, settings: Settings) {
  const ctx = pianoAudio.ensure();
  if (!ctx) return;

  const secondsPerBeat = 60 / (song.bpm * settings.tempoFactor);
  const t0 = ctx.currentTime + 0.05;

  for (const note of song.notes.slice(0, 8)) {
    pianoAudio.playNote(
      note.midi,
      note.durationBeats * secondsPerBeat,
      t0 + note.startBeat * secondsPerBeat,
      0.6,
    );
  }
}

export default function SongSelection({ settings, onPick, onBack }: SongSelectionProps) {
  const { t } = useLanguage();
  const progress = loadProgress();

  const difficultyLabel = (song: Song) =>
    song.difficulty === 'easy'
      ? t.pianoEasy
      : song.difficulty === 'medium'
        ? t.pianoMedium
        : t.pianoChallenge;

  const preview = useCallback((song: Song) => previewSong(song, settings), [settings]);

  return (
    <Stack data-pw="piano-song-selection" spacing={1.5}>
      <Typography variant="h5" fontWeight={700}>
        {t.pianoChooseSong}
      </Typography>

      <Stack spacing={1}>
        {SONGS.map((song) => {
          const entry = progress[song.id];
          return (
            <Card
              key={song.id}
              data-pw={`piano-song-card-${song.id}`}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {t[song.titleKey]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {difficultyLabel(song)} · {song.notes.length} {t.pianoTotalNotes}
                </Typography>
                <Stars count={entry?.stars ?? 0} size={16} />
              </Box>

              <Stack direction="row" spacing={0.5}>
                <Button
                  data-pw={`piano-preview-${song.id}`}
                  size="small"
                  onClick={() => preview(song)}
                >
                  {t.pianoPreview}
                </Button>
                <Button
                  data-pw={`piano-play-${song.id}`}
                  variant="contained"
                  size="large"
                  onClick={() => onPick(song.id)}
                >
                  {t.pianoPlay}
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <Button data-pw="piano-back-home" size="large" onClick={onBack}>
        {t.pianoBack}
      </Button>
    </Stack>
  );
}
