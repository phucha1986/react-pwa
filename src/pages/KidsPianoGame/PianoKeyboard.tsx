import { Box, Button } from '@mui/material';

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

interface PianoKeyboardProps {
  onKeyPress: (note: string) => void;
  onKeyRelease: (note: string) => void;
  activeKeys: Record<string, boolean>;
  isPlaying: boolean;
}

const PianoKeyboard = ({ 
  onKeyPress, 
  onKeyRelease, 
  activeKeys,
  isPlaying
}: PianoKeyboardProps) => {
  // Handle key press event
  const handleKeyDown = (note: string) => {
    if (!isPlaying) return;
    onKeyPress(note);
  };

  // Handle key release event
  const handleKeyUp = (note: string) => {
    if (!isPlaying) return;
    onKeyRelease(note);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end',
        height: '20%',
        p: 2,
        backgroundColor: '#4C6EF5',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}
    >
      {/* White keys */}
      <Box sx={{ display: 'flex', position: 'relative' }}>
        {WHITE_KEYS.map((key, index) => (
          <Button
            key={index}
            onMouseDown={() => handleKeyDown(key.note)}
            onMouseUp={() => handleKeyUp(key.note)}
            onMouseLeave={() => handleKeyUp(key.note)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown(key.note);
            }}
            onTouchEnd={() => handleKeyUp(key.note)}
            sx={{
              width: '50px',
              height: '150px',
              backgroundColor: activeKeys[key.note] ? '#3a86ff' : 'white',
              color: activeKeys[key.note] ? 'white' : 'black',
              border: '1px solid #888',
              borderRadius: 0,
              margin: '0 1px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: activeKeys[key.note] ? '#3a86ff' : '#f0f0f0',
              },
              '&:active': {
                backgroundColor: '#3a86ff',
              },
              zIndex: 1,
            }}
          >
            {key.note}
          </Button>
        ))}
        
        {/* Black keys positioned above white keys */}
        {BLACK_KEYS.map((key, index) => (
          <Button
            key={index}
            onMouseDown={() => handleKeyDown(key.note)}
            onMouseUp={() => handleKeyUp(key.note)}
            onMouseLeave={() => handleKeyUp(key.note)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown(key.note);
            }}
            onTouchEnd={() => handleKeyUp(key.note)}
            sx={{
              position: 'absolute',
              left: `${(index * 50 + 35)}px`, // Adjust positioning
              width: '30px',
              height: '90px',
              backgroundColor: activeKeys[key.note] ? '#1a4d8c' : '#333',
              color: activeKeys[key.note] ? 'white' : 'white',
              border: '1px solid #000',
              borderRadius: 0,
              zIndex: 2,
              '&:hover': {
                backgroundColor: activeKeys[key.note] ? '#1a4d8c' : '#555',
              },
              '&:active': {
                backgroundColor: '#1a4d8c',
              },
            }}
          >
            {key.note}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default PianoKeyboard;