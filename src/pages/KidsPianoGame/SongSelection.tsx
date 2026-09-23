import { Box, Typography, Button } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

// Define the songs for the kids piano game
const SONGS = [
  {
    id: 1,
    name: 'Twinkle Twinkle Little Star',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
    tempo: 120
  },
  {
    id: 2,
    name: 'Happy Birthday',
    notes: ['C', 'C', 'D', 'C', 'F', 'E'],
    tempo: 120
  },
  {
    id: 3,
    name: 'If You\'re Happy and You Know It',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'],
    tempo: 120
  },
  {
    id: 4,
    name: 'Mary Had a Little Lamb',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'],
    tempo: 120
  }
];

interface SongSelectionProps {
  onSelectSong: (song: { id: number; name: string; notes: string[]; tempo: number }) => void;
}

const SongSelection = ({ onSelectSong }: SongSelectionProps) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 2,
      backgroundColor: '#f0f8ff',
    }}
  >
    <Typography 
      variant="h4" 
      sx={{ 
        mb: 3, 
        color: '#4C6EF5', 
        fontWeight: 'bold',
        textAlign: 'center'
      }}
    >
      🎹 Kids Piano Game 🎹
    </Typography>
    
    <Box sx={{ mb: 3 }}>
      <MusicNote sx={{ fontSize: 60, color: '#FFD700' }} />
    </Box>
    
    <Typography 
      variant="h6" 
      sx={{ 
        mb: 4, 
        textAlign: 'center',
        color: '#333'
      }}
    >
      Choose a song to play!
    </Typography>
    
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
      {SONGS.map((song) => (
        <Button
          key={song.id}
          onClick={() => onSelectSong(song)}
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            height: 60,
            fontSize: 18,
            fontWeight: 'bold',
            borderRadius: 3,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: '#45a049',
              transform: 'scale(1.02)',
            },
          }}
        >
          {song.name}
        </Button>
      ))}
    </Box>
    
    <Typography 
      variant="body2" 
      sx={{ 
        mt: 4, 
        color: '#666',
        textAlign: 'center'
      }}
    >
      Play with your fingers or use the piano keys!
    </Typography>
  </Box>
);

export default SongSelection;