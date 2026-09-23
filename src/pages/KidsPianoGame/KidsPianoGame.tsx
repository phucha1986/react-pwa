import { useState } from 'react';

import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';

import GameScreen from './GameScreen';

// Define songs for kids
const SONGS = [
  {
    name: 'Twinkle Twinkle Little Star',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
    tempo: 120,
  },
  {
    name: 'Happy Birthday',
    notes: ['C', 'C', 'D', 'C', 'F', 'E'],
    tempo: 120,
  },
  {
    name: "If You're Happy and You Know It",
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    tempo: 130,
  },
];

const KidsPianoGame = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [currentSong, setCurrentSong] = useState<{ name: string; notes: string[]; tempo: number }>(
    SONGS[0],
  );

  const startGame = (song: { name: string; notes: string[]; tempo: number }) => {
    setCurrentSong(song);
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f8ff',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Kids Piano Game
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {SONGS.map((song, index) => (
            <Card key={index} sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {song.name}
                </Typography>
                <Typography color="textSecondary">Tempo: {song.tempo}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => startGame(song)}
                  variant="contained"
                  sx={{ backgroundColor: '#4CAF50' }}
                >
                  Play
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return <GameScreen song={currentSong} onEndGame={endGame} />;
};

export default KidsPianoGame;
