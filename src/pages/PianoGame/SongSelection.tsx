import { useCallback, useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { pianoAudio } from '@/features/piano/audio';
import { PALETTE } from '@/features/piano/draw';
import { SONGS } from '@/features/piano/songs';
import { loadProgress } from '@/features/piano/storage';
import type { Difficulty, Settings, Song } from '@/features/piano/types';
import { useLanguage } from '@/i18n/useLanguage';

import Stars from './Stars';
import {
  DIFFICULTY_COLOR,
  GOLD,
  MUTED,
  NAVY_BORDER,
  NAVY_CARD,
  PURPLE,
  TEXT,
  TOUCH_TARGET,
} from './palette';

type Filter = Difficulty | 'all';

const FILTERS: Filter[] = ['all', 'easy', 'medium', 'challenge'];

const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  easy: '🌱',
  medium: '🌟',
  challenge: '🚀',
};

/** Note colour comes from the song's first note, so it matches the falling notes. */
function songColor(song: Song) {
  const first = song.notes[0]?.midi ?? 60;
  return PALETTE[((first % 12) + 12) % 12];
}

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

/** PianoFlow-style song library: dark navy cards, difficulty chips, purple Play button. */
export default function SongSelection({ settings, onPick, onBack }: SongSelectionProps) {
  const { t } = useLanguage();
  const progress = loadProgress();
  const [filter, setFilter] = useState<Filter>('all');

  const difficultyLabel = (song: Song) =>
    song.difficulty === 'easy'
      ? t.pianoEasy
      : song.difficulty === 'medium'
        ? t.pianoMedium
        : t.pianoChallenge;

  const filterLabel = (f: Filter) =>
    f === 'all'
      ? t.pianoFilterAll
      : f === 'easy'
        ? t.pianoEasy
        : f === 'medium'
          ? t.pianoMedium
          : t.pianoChallenge;

  const preview = useCallback((song: Song) => previewSong(song, settings), [settings]);

  const songs = SONGS.filter((song) => filter === 'all' || song.difficulty === filter);

  return (
    <Stack data-pw="piano-song-selection" spacing={1.5} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          data-pw="piano-back-home"
          role="button"
          tabIndex={0}
          aria-label={t.pianoBack}
          onClick={onBack}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onBack();
          }}
          sx={{
            ...TOUCH_TARGET,
            width: 48,
            borderRadius: 999,
            bgcolor: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            color: TEXT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ←
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ flex: 1, color: TEXT }} noWrap>
          {t.pianoChooseSong}
        </Typography>
      </Stack>

      <Stack
        data-pw="piano-filter-chips"
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          const color = f === 'all' ? PURPLE : DIFFICULTY_COLOR[f];

          return (
            <Box
              key={f}
              data-pw={`piano-filter-${f}`}
              role="button"
              tabIndex={0}
              onClick={() => setFilter(f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setFilter(f);
              }}
              sx={{
                px: 1.5,
                py: 0.5,
                minHeight: 40,
                borderRadius: 999,
                bgcolor: active ? color : 'transparent',
                border: `1px solid ${active ? color : NAVY_BORDER}`,
                color: active ? '#fff' : MUTED,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {filterLabel(f)}
            </Box>
          );
        })}
      </Stack>

      <Stack data-pw="piano-song-list" spacing={1.25}>
        {songs.map((song) => {
          const entry = progress[song.id];
          const accent = songColor(song);

          return (
            <Box
              key={song.id}
              data-pw={`piano-song-card-${song.id}`}
              sx={{
                p: 1.25,
                bgcolor: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
                borderRadius: 16,
                color: TEXT,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 999,
                  bgcolor: GOLD,
                  color: '#1b1400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                ★
              </Box>

              <Box sx={{ flex: 1, minWidth: 160 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap>
                  {t[song.titleKey]}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor: DIFFICULTY_COLOR[song.difficulty],
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {DIFFICULTY_EMOJI[song.difficulty]} {difficultyLabel(song)}
                  </Box>
                  <Typography variant="body2" sx={{ color: MUTED }} noWrap>
                    {song.notes.length} {t.pianoTotalNotes}
                  </Typography>
                </Stack>
                <Stars count={entry?.stars ?? 0} size={16} />
              </Box>

              <Button
                data-pw={`piano-play-${song.id}`}
                size="large"
                variant="contained"
                onClick={() => onPick(song.id)}
                sx={{
                  ...TOUCH_TARGET,
                  px: 2,
                  borderRadius: 999,
                  bgcolor: PURPLE,
                  color: '#fff',
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                ▶ {t.pianoPlay}
              </Button>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{ width: '100%', flexWrap: 'wrap', mt: 0.5 }}
              >
                <Button
                  data-pw={`piano-preview-${song.id}`}
                  size="large"
                  variant="text"
                  onClick={() => preview(song)}
                  sx={{
                    ...TOUCH_TARGET,
                    flex: 1,
                    minWidth: 120,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: accent,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  ♪ {t.pianoPreview}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
