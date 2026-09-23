import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Slider } from '@mui/material';
import { PlayArrow, Pause, Start } from '@mui/icons-material';
import FallingNotes from './FallingNotes';
import PianoKeyboard from './PianoKeyboard';
import { playPianoNote } from './sound';

// Define the piano keys for 5-year-olds (C4 to G5: 10 white keys + 7 black keys)
const WHITE_KEYS = [
  { note: 'C', freq: 261.63 }, // C4
  { note: 'D', freq: 293.66 }, // D4
  { note: 'E', freq: 329.63 }, // E4
  { note: 'F', freq: 349.23 }, // F4
  { note: 'G', freq: 392.00 }, // G4
  { note: 'A', freq: 440.00 }, // A4
  { note: 'B', freq: 493.88 }, // B4
  { note: 'C', freq: 523.25 }, // C5
  { note: 'D', freq: 587.33 }, // D5
  { note: 'E', freq: 659.25 }, // E5
];

const BLACK_KEYS = [
  { note: 'C#', freq: 277.18 }, // C#4
  { note: 'D#', freq: 311.13 }, // D#4
  { note: 'F#', freq: 369.99 }, // F#4
  { note: 'G#', freq: 415.30 }, // G#4
  { note: 'A#', freq: 466.16 }, // A#4
  { note: 'C#', freq: 554.37 }, // C#5
  { note: 'D#', freq: 622.25 }, // D#5
];

interface GameScreenProps {
  song: { name: string; notes: string[]; tempo: number };
  onEndGame: () => void;
}

const GameScreen = ({ song, onEndGame }: GameScreenProps) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tempo, setTempo] = useState(120); // Default tempo
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  // const [notesHit, setNotesHit] = useState<number>(0); // Remove unused variable

  // Initialize tempo when song changes
  useEffect(() => {
    if (song && song.tempo) {
      setTempo(song.tempo);
    }
  }, [song]);

  // Handle key press for piano
  const handleKeyPress = (note: string) => {
    if (!isPlaying || !song) return;
    
    setActiveKeys(prev => ({ ...prev, [note]: true }));
    
    // Find the frequency of the pressed note
    const whiteKey = WHITE_KEYS.find(key => key.note === note);
    const blackKey = BLACK_KEYS.find(key => key.note === note);
    const frequency = whiteKey ? whiteKey.freq : blackKey ? blackKey.freq : 261.63; // Default to C4 if not found
    
    playPianoNote(frequency); // Play the actual note sound
    
    // Simple scoring for demonstration
    setScore(prev => prev + (combo > 0 ? 10 * combo : 10));
    setCombo(prev => prev + 1);
  };

  // Handle key release for piano
  const handleKeyRelease = (note: string) => {
    setActiveKeys(prev => ({ ...prev, [note]: false }));
  };

  // Create song notes with timing information
  const createSongNotesWithTiming = () => {
    if (!song || !song.notes) return [];
    
    // Generate note objects with timing
    return song.notes.map((note: string, index: number) => ({
      note,
      time: index * 500 // Simple timing - each note appears every half second
    }));
  };

  const songNotesWithTiming = createSongNotesWithTiming();

  // If no song is available, don't render anything (this shouldn't happen in normal operation)
  if (!song) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: '#f0f8ff',
      }}
    >
      {/* Game header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#4C6EF5',
          color: 'white',
          borderBottom: '2px solid #3a86ff'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {song.name || 'Loading...'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box 
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#333', 
              px: 2, 
              py: 1, 
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Score: {score}
          </Box>
          <Box 
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#333', 
              px: 2, 
              py: 1, 
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Combo: {combo}x
          </Box>
        </Box>
      </Box>
      
      {/* Falling notes area */}
      <FallingNotes 
        songNotes={songNotesWithTiming}
        isPlaying={isPlaying}
        tempo={tempo}
      />
      
      {/* Piano keyboard */}
      <PianoKeyboard
        onKeyPress={handleKeyPress}
        onKeyRelease={handleKeyRelease}
        activeKeys={activeKeys}
        isPlaying={isPlaying}
      />
      
      {/* Controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 2, 
          p: 2,
          backgroundColor: '#4C6EF5',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px'
        }}
      >
        <IconButton 
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{ 
            backgroundColor: isPlaying ? '#FF5252' : '#4CAF50',
            color: 'white',
            width: 50,
            height: 50,
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton 
          onClick={onEndGame}
          sx={{ 
            backgroundColor: '#FFD700',
            color: '#333',
            width: 50,
            height: 50,
          }}
        >
          <Start />
        </IconButton>
        
        <Slider
          value={tempo}
          onChange={(_, newValue) => setTempo(newValue as number)}
          min={80}
          max={160}
          step={10}
          sx={{ width: 150, color: '#FFD700' }}
        />
      </Box>
    </Box>
  );
};

export default GameScreen;