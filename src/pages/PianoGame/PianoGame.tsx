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

type Screen = 'home' | 'songs' | 'play' | 'settings' | 'progress';

/** The main menu links here with ?screen=songs so a child lands straight on the song list. */
function initialScreen(): Screen {
  return new URLSearchParams(window.location.search).get('screen') === 'songs' ? 'songs' : 'home';
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

  const song = useMemo(() => getSong(songId) ?? SONGS[0], [songId]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
  };

  const openSong = (id: string) => {
    setSongId(id);
    setScreen('play');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Box data-pw="piano-game">
        {screen === 'home' ? (
          <Home
            onPlay={() => setScreen('songs')}
            onContinue={() => setScreen('play')}
            onSettings={() => setScreen('settings')}
            onProgress={() => setScreen('progress')}
          />
        ) : null}

        {screen === 'songs' ? (
          <SongSelection settings={settings} onPick={openSong} onBack={() => setScreen('home')} />
        ) : null}

        {screen === 'play' ? (
          <GamePlay
            song={song}
            settings={settings}
            onHome={() => setScreen('home')}
            onPickSong={() => setScreen('songs')}
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
