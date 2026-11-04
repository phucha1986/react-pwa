import { useState } from 'react';

import { Box, Button, Stack, TextField, Typography } from '@mui/material';

import { decodeCoopCode, encodeCoopCode } from '@/features/piano/coop';
import { SONGS } from '@/features/piano/songs';
import { useLanguage } from '@/i18n/useLanguage';

import { GOLD, MUTED, NAVY_BORDER, NAVY_CARD, PURPLE, TEXT, TOUCH_TARGET } from './palette';

interface CoopProps {
  /** Which role this device is playing: the host shares a code, the guest enters one. */
  side: 'host' | 'guest';
  /** Called once the game is ready to start: hand the resolved song id to the caller. */
  onStart: (songId: string) => void;
  onBack: () => void;
}

/**
 * Co-op lobby. Fully client-side: the host picks a song and shows a short code
 * derived from it; the guest types that code, which resolves back to the same
 * song on their own device. Both sides then hit Start and run the shared
 * countdown so the identical song begins at the same logical moment.
 */
export default function Coop({ side, onStart, onBack }: CoopProps) {
  return side === 'host' ? (
    <CoopHost side={side} onStart={onStart} onBack={onBack} />
  ) : (
    <CoopJoin side={side} onStart={onStart} onBack={onBack} />
  );
}

/** Host lobby: choose a song, show its invite code, wait for a guest, then Start. */
function CoopHost({ onStart, onBack }: CoopProps) {
  const { t } = useLanguage();
  const [songId, setSongId] = useState<string>(SONGS[0].id);
  const code = encodeCoopCode(songId);

  return (
    <Stack data-pw="piano-coop-host" spacing={1.5} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          data-pw="piano-coop-back"
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
          {t.coopTitle}
        </Typography>
      </Stack>

      <Typography variant="body2" sx={{ color: MUTED }}>
        {t.coopHint}
      </Typography>

      {/* Pick the song the two devices will share. */}
      <Stack
        data-pw="piano-coop-songs"
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        {SONGS.map((song) => (
          <Button
            key={song.id}
            data-pw={`piano-coop-song-${song.id}`}
            variant="text"
            size="medium"
            onClick={() => setSongId(song.id)}
            sx={{
              ...TOUCH_TARGET,
              bgcolor: song.id === songId ? PURPLE : NAVY_CARD,
              border: `1px solid ${NAVY_BORDER}`,
              color: TEXT,
              borderRadius: 16,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {t[song.titleKey]}
          </Button>
        ))}
      </Stack>

      {/* The invite code the guest types on their own device. */}
      <Box
        data-pw="piano-coop-code"
        sx={{
          p: 1.5,
          borderRadius: 16,
          bgcolor: NAVY_CARD,
          border: `1px solid ${NAVY_BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ color: MUTED }}>
          {t.coopYourCode}
        </Typography>
        <Typography
          data-pw="piano-coop-code-value"
          variant="h4"
          fontWeight={900}
          sx={{ color: GOLD, letterSpacing: 2 }}
        >
          {code}
        </Typography>
        <Typography variant="body2" sx={{ color: MUTED }}>
          {t.coopShareCode}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: MUTED }}>
        {t.coopWaiting}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Button
          data-pw="piano-coop-start"
          variant="contained"
          size="medium"
          onClick={() => onStart(songId)}
          sx={{
            ...TOUCH_TARGET,
            bgcolor: PURPLE,
            color: '#fff',
            borderRadius: 999,
            fontWeight: 800,
            textTransform: 'none',
          }}
        >
          {t.coopStart}
        </Button>
      </Stack>
    </Stack>
  );
}

/** Guest lobby: type the host's code, resolve it to the shared song, then Start. */
function CoopJoin({ onStart }: CoopProps) {
  const { t } = useLanguage();
  // The guest types the host's code. For a shareable link the code can also come
  // in via the ?code= query so a guest can open a ready-made join URL.
  const initialCode = new URLSearchParams(window.location.search).get('code') ?? '';
  const [code, setCode] = useState(initialCode);

  const songIds = SONGS.map((song) => song.id);
  const resolved = decodeCoopCode(code, songIds);

  return (
    <Stack data-pw="piano-coop-join" spacing={1.5} sx={{ py: 1 }}>
      <Typography variant="h5" fontWeight={800} sx={{ color: TEXT }} noWrap>
        {t.coopJoinTitle}
      </Typography>
      <Typography variant="body2" sx={{ color: MUTED }}>
        {t.coopSplitHintGuest}
      </Typography>

      <Box
        data-pw="piano-coop-enter"
        sx={{
          p: 1.5,
          borderRadius: 16,
          bgcolor: NAVY_CARD,
          border: `1px solid ${NAVY_BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ color: MUTED }}>
          {t.coopEnterCode}
        </Typography>
        <TextField
          data-pw="piano-coop-code-input"
          aria-label={t.coopEnterCode}
          onChange={(value) => setCode(String(value))}
          sx={{
            '& .MuiInputBase-Input': { color: GOLD, letterSpacing: 2 },
            bgcolor: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderRadius: 12,
            color: TEXT,
            minWidth: 160,
          }}
        />
        <Typography
          data-pw="piano-coop-code-value"
          variant="h4"
          fontWeight={900}
          sx={{ color: GOLD, letterSpacing: 2 }}
        >
          {code || '····'}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Button
          data-pw="piano-coop-join-start"
          variant="contained"
          size="medium"
          disabled={resolved === null}
          onClick={() => {
            if (resolved) onStart(resolved);
          }}
          sx={{
            ...TOUCH_TARGET,
            bgcolor: PURPLE,
            color: '#fff',
            borderRadius: 999,
            fontWeight: 800,
            textTransform: 'none',
          }}
        >
          {t.coopStart}
        </Button>
      </Stack>
    </Stack>
  );
}
