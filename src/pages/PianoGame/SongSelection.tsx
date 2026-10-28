import { useCallback } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { pianoAudio } from '@/features/piano/audio';
import { PALETTE } from '@/features/piano/draw';
import { noteLetter } from '@/features/piano/midi';
import { SONGS } from '@/features/piano/songs';
import { loadProgress } from '@/features/piano/storage';
import type { Settings, Song } from '@/features/piano/types';
import { useLanguage } from '@/i18n/useLanguage';

import Stars from './Stars';

/** Card colour comes from the song's first note, so it matches the falling notes. */
function songColor(song: Song) {
  const first = song.notes[0]?.midi ?? 60;
  return PALETTE[((first % 12) + 12) % 12];
}

const DIFFICULTY_EMOJI: Record<Song['difficulty'], string> = {
  easy: '🌱',
  medium: '🌟',
  challenge: '🚀',
};

/** Kid-sized touch targets (>= 44px). */
const TOUCH_TARGET = { minHeight: 48, minWidth: 48 };

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
    <Stack data-pw="piano-song-selection" spacing={2} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          data-pw="piano-back-home"
          size="large"
          variant="contained"
          onClick={onBack}
          sx={{ ...TOUCH_TARGET, bgcolor: '#3E63DD', color: '#fff', borderRadius: 2 }}
        >
          ← {t.pianoBack}
        </Button>
        <Typography variant="h5" fontWeight={800} sx={{ flex: 1 }} noWrap>
          {t.pianoChooseSong}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {SONGS.map((song) => {
          const entry = progress[song.id];
          const color = songColor(song);

          return (
            <Box
              key={song.id}
              data-pw={`piano-song-card-${song.id}`}
              sx={{
                p: 1.5,
                bgcolor: color,
                color: '#fff',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: 'wrap',
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.92)',
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {noteLetter(song.notes[0]?.midi ?? 60)}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap>
                  {t[song.titleKey]}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }} noWrap>
                  {DIFFICULTY_EMOJI[song.difficulty]} {difficultyLabel(song)} · {song.notes.length}{' '}
                  {t.pianoTotalNotes}
                </Typography>
                <Stars count={entry?.stars ?? 0} size={18} />
              </Box>

              <Stack direction="row" spacing={0.75} sx={{ width: '100%', flexWrap: 'wrap', mt: 1 }}>
                <Button
                  data-pw={`piano-preview-${song.id}`}
                  size="large"
                  variant="contained"
                  onClick={() => preview(song)}
                  sx={{
                    ...TOUCH_TARGET,
                    flex: 1,
                    minWidth: 120,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  ♪ {t.pianoPreview}
                </Button>
                <Button
                  data-pw={`piano-play-${song.id}`}
                  size="large"
                  variant="contained"
                  onClick={() => onPick(song.id)}
                  sx={{
                    ...TOUCH_TARGET,
                    flex: 1,
                    minWidth: 120,
                    bgcolor: '#1F2937',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  ▶ {t.pianoPlay}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
