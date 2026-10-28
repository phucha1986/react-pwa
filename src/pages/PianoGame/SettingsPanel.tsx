import { Box, Button, MenuItem, Select, Slider, Stack, Switch, Typography } from '@mui/material';

import { pianoAudio } from '@/features/piano/audio';
import { saveSettings } from '@/features/piano/storage';
import type { Difficulty, Settings } from '@/features/piano/types';
import { useLanguage } from '@/i18n/useLanguage';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
}

export default function SettingsPanel({ settings, onChange, onBack }: SettingsPanelProps) {
  const { t } = useLanguage();

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    saveSettings(next);
    pianoAudio.setVolume(next.volume);
    pianoAudio.setMuted(next.muted);
    onChange(next);
  };

  return (
    <Stack data-pw="piano-settings" spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t.pianoSettings}
      </Typography>

      <Box data-pw="piano-difficulty">
        <Typography variant="subtitle2">{t.pianoDifficulty}</Typography>
        <Select
          value={settings.difficultyMode}
          onChange={(e) => update({ difficultyMode: e.target.value as Difficulty })}
          sx={{ minWidth: 180, minHeight: 44 }}
        >
          <MenuItem value="easy">{t.pianoEasy}</MenuItem>
          <MenuItem value="medium">{t.pianoMedium}</MenuItem>
          <MenuItem value="challenge">{t.pianoChallenge}</MenuItem>
        </Select>
      </Box>

      <Box data-pw="piano-volume">
        <Typography variant="subtitle2">{t.pianoVolume}</Typography>
        <Slider
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(_, v) => update({ volume: Number(v) })}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Switch
          data-pw="piano-mute"
          checked={settings.muted}
          onChange={(e) => update({ muted: e.target.checked })}
        />
        <Typography>{t.pianoMute}</Typography>
      </Stack>

      <Box data-pw="piano-tempo">
        <Typography variant="subtitle2">{t.pianoTempo}</Typography>
        <Slider
          value={settings.tempoFactor}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(_, v) => update({ tempoFactor: Number(v) })}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Switch
          data-pw="piano-show-note-names"
          checked={settings.showNoteNames}
          onChange={(e) => update({ showNoteNames: e.target.checked })}
        />
        <Typography>{t.pianoShowNoteNames}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Switch
          data-pw="piano-animations"
          checked={settings.animations}
          onChange={(e) => update({ animations: e.target.checked })}
        />
        <Typography>{t.pianoAnimations}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Switch
          data-pw="piano-auto-play"
          checked={settings.autoPlayMelody}
          onChange={(e) => update({ autoPlayMelody: e.target.checked })}
        />
        <Typography>{t.pianoFreePlay}</Typography>
      </Stack>

      <Button data-pw="piano-settings-back" size="large" onClick={onBack}>
        {t.pianoBack}
      </Button>
    </Stack>
  );
}
