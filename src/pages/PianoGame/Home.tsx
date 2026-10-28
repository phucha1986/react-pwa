import { Button, Stack, Typography } from '@mui/material';

import { loadProgress } from '@/features/piano/storage';
import { useLanguage } from '@/i18n/useLanguage';

interface HomeProps {
  onPlay: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onProgress: () => void;
}

export default function Home({ onPlay, onContinue, onSettings, onProgress }: HomeProps) {
  const { t } = useLanguage();
  const progress = loadProgress();
  const hasProgress = Object.keys(progress).length > 0;

  return (
    <Stack
      data-pw="piano-home"
      spacing={2}
      sx={{ alignItems: 'center', textAlign: 'center', py: 3 }}
    >
      <Typography variant="h4" fontWeight={700}>
        {t.pianoTitle}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t.pianoHint}
      </Typography>

      <Button
        data-pw="piano-play"
        variant="contained"
        size="large"
        onClick={onPlay}
        sx={{ minWidth: 200, minHeight: 56, fontSize: 18 }}
      >
        {t.pianoPlay}
      </Button>

      {hasProgress ? (
        <Button
          data-pw="piano-continue"
          variant="outlined"
          size="large"
          onClick={onContinue}
          sx={{ minWidth: 200, minHeight: 48 }}
        >
          {t.pianoContinue}
        </Button>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button data-pw="piano-settings" variant="text" size="large" onClick={onSettings}>
          {t.pianoSettings}
        </Button>
        <Button data-pw="piano-progress" variant="text" size="large" onClick={onProgress}>
          {t.pianoProgressTitle}
        </Button>
      </Stack>
    </Stack>
  );
}
