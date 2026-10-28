import { Box, Button, Stack, Typography } from '@mui/material';

import { loadProgress } from '@/features/piano/storage';
import { useLanguage } from '@/i18n/useLanguage';

import {
  MUTED,
  NAVY_BORDER,
  NAVY_CARD,
  PURPLE,
  PURPLE_DEEP,
  TEAL,
  TEXT,
  TOUCH_TARGET,
} from './palette';

interface HomeProps {
  onPlay: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onProgress: () => void;
}

const pillCard = (color: string) => ({
  ...TOUCH_TARGET,
  p: 1.5,
  borderRadius: 999,
  bgcolor: color,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  justifyContent: 'space-between',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  textTransform: 'none',
});

/** PianoFlow-style landing: logo block plus big rounded pill cards. */
export default function Home({ onPlay, onContinue, onSettings, onProgress }: HomeProps) {
  const { t } = useLanguage();
  const progress = loadProgress();
  const hasProgress = Object.keys(progress).length > 0;

  return (
    <Stack data-pw="piano-home" spacing={1.5} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DEEP})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
          }}
        >
          🎹
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: TEXT }} noWrap>
            {t.pianoTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>
            {t.pianoHint}
          </Typography>
        </Box>
      </Stack>

      <Button
        data-pw="piano-play"
        variant="contained"
        size="large"
        onClick={onPlay}
        sx={pillCard(PURPLE)}
      >
        <Box sx={{ flex: 1, textAlign: 'left' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff' }}>
            {t.pianoPlay}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
            {t.pianoChooseSong}
          </Typography>
        </Box>
        <Box sx={{ fontSize: 20 }}>›</Box>
      </Button>

      {hasProgress ? (
        <Button
          data-pw="piano-continue"
          variant="contained"
          size="large"
          onClick={onContinue}
          sx={pillCard(TEAL)}
        >
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff' }}>
              {t.pianoContinue}
            </Typography>
          </Box>
          <Box sx={{ fontSize: 20 }}>›</Box>
        </Button>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Button
          data-pw="piano-settings"
          variant="text"
          size="large"
          onClick={onSettings}
          sx={{
            ...TOUCH_TARGET,
            borderRadius: 999,
            bgcolor: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            color: TEXT,
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          {t.pianoSettings}
        </Button>
        <Button
          data-pw="piano-progress"
          variant="text"
          size="large"
          onClick={onProgress}
          sx={{
            ...TOUCH_TARGET,
            borderRadius: 999,
            bgcolor: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            color: TEXT,
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          {t.pianoProgressTitle}
        </Button>
      </Stack>
    </Stack>
  );
}
