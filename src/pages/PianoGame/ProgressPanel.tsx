import { Box, Button, Card, Stack, Typography } from '@mui/material';

import { SONGS } from '@/features/piano/songs';
import { loadProgress } from '@/features/piano/storage';
import { useLanguage } from '@/i18n/useLanguage';

import Stars from './Stars';
import { MUTED, NAVY_BORDER, NAVY_CARD, TEXT, TOUCH_TARGET } from './palette';

export default function ProgressPanel({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const progress = loadProgress();
  const completed = SONGS.filter((song) => progress[song.id]?.completions > 0);

  return (
    <Stack data-pw="piano-progress" spacing={1.5}>
      <Typography variant="h5" fontWeight={800} sx={{ color: TEXT }}>
        {t.pianoProgressTitle}
      </Typography>

      <Typography variant="body1" sx={{ color: MUTED }}>
        {t.pianoSongsCompleted}: {completed.length} / {SONGS.length}
      </Typography>

      <Stack spacing={1}>
        {SONGS.map((song) => {
          const entry = progress[song.id];
          return (
            <Card
              key={song.id}
              data-pw={`piano-progress-row-${song.id}`}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
                borderRadius: 16,
                color: TEXT,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {t[song.titleKey]}
                </Typography>
                <Typography variant="body2" sx={{ color: MUTED }}>
                  {entry
                    ? `${t.pianoAccuracy}: ${Math.round(entry.bestAccuracy * 100)}% · ${entry.completions}`
                    : '—'}
                </Typography>
              </Box>
              <Stars count={entry?.stars ?? 0} size={16} />
            </Card>
          );
        })}
      </Stack>

      <Button
        data-pw="piano-progress-back"
        size="large"
        variant="text"
        onClick={onBack}
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
  );
}
