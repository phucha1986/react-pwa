import { useMemo, useState } from 'react';

import { Box, Container } from '@mui/material';

import { SONGS, getSong } from '@/features/piano/songs';
import { loadSettings } from '@/features/piano/storage';
import type { Settings } from '@/features/piano/types';

import GamePlay from './GamePlay';
import Home from './Home';
import ProgressPanel from './ProgressPanel';
import SettingsPanel from './SettingsPanel';
import SongSelection from './SongSelection';
import Coop from './Coop';
import { NAVY, NAVY_BORDER, TEXT } from './palette';

type Screen = 'home' | 'songs' | 'play' | 'settings' | 'progress' | 'coop';

/** The main menu links here with ?screen=songs so a child lands straight on the song list. */
function initialScreen(): Screen {
  const screen = new URLSearchParams(window.location.search).get('screen');
  if (screen === 'songs') return 'songs';
  if (screen === 'coop') return 'coop';
  return 'home';
}

/** Co-op side comes from the URL so a guest can open a ready-made join link (?side=guest&code=XXXX). */
function initialCoopSide(): 'host' | 'guest' {
  return new URLSearchParams(window.location.search).get('side') === 'guest' ? 'guest' : 'host';
}

/** Respect the OS "reduce motion" preference on first load. */
function initialSettings(): Settings {
  const settings = loadSettings();
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    settings.animations = false;
  }
  return settings;
}

export default function PianoGame() {
  const [settings, setSettings] = useState<Settings>(() => initialSettings());
  const [screen, setScreen] = useState<Screen>(() => initialScreen());
  const [songId, setSongId] = useState<string>(SONGS[0].id);
  const coopSide = initialCoopSide();
  const [coopActive, setCoopActive] = useState(false);

  const song = useMemo(() => getSong(songId) ?? SONGS[0], [songId]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
  };

  const openSong = (id: string) => {
    setSongId(id);
    setScreen('play');
  };

  // Co-op hand-off: the lobby resolved a shared song, so start play for this side.
  const startCoop = (id: string) => {
    setSongId(id);
    setCoopActive(true);
    setScreen('play');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 2,
        bgcolor: NAVY,
        color: TEXT,
        borderRadius: 20,
        border: `1px solid ${NAVY_BORDER}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.35)`,
      }}
    >
      <Box data-pw="piano-game">
        {screen === 'home' ? (
          <Home
            onPlay={() => setScreen('songs')}
            onContinue={() => setScreen('play')}
            onSettings={() => setScreen('settings')}
            onProgress={() => setScreen('progress')}
            onCoop={() => setScreen('coop')}
          />
        ) : null}

        {screen === 'songs' ? (
          <SongSelection settings={settings} onPick={openSong} onBack={() => setScreen('home')} />
        ) : null}

        {screen === 'play' ? (
          <GamePlay
            song={song}
            settings={settings}
            coopSide={coopActive ? coopSide : undefined}
            onHome={() => setScreen('home')}
            onPickSong={() => setScreen('songs')}
          />
        ) : null}

        {screen === 'coop' ? (
          <Coop
            side={coopSide}
            onStart={startCoop}
            onBack={() => setScreen('home')}
          />
        ) : null}

        {screen === 'settings' ? (
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onBack={() => setScreen('home')}
          />
        ) : null}

        {screen === 'progress' ? <ProgressPanel onBack={() => setScreen('home')} /> : null}
      </Box>
    </Container>
  );
}
