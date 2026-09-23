import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

// Define songs for kids
const SONGS = [
  {
    name: "Twinkle Twinkle Little Star",
    notes: ["C", "C", "G", "G", "A", "A", "G"],
    tempo: 120,
  },
  {
    name: "Happy Birthday",
    notes: ["C", "C", "D", "C", "F", "E"],
    tempo: 120,
  },
  {
    name: "If You're Happy and You Know It",
    notes: ["C", "D", "E", "F", "G", "A", "B"],
    tempo: 130,
  }
];

const AutoPlayGame = () => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start auto-play mode
  const startAutoPlay = () => {
    setIsAutoPlaying(true);
    setCurrentSongIndex(0);
    setProgress(0);
    
    // Simulate playing songs sequentially
    playNextSong();
  };

  // Play the next song in sequence
  const playNextSong = () => {
    if (currentSongIndex >= SONGS.length) {
      // All songs played, stop auto-play
      setIsAutoPlaying(false);
      return;
    }

    // Simulate playing the song for 3 seconds
    const songDuration = 3000;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentSongIndex(prevIndex => prevIndex + 1);
          playNextSong();
          return 0;
        }
        return newProgress;
      });
    }, songDuration / 10);
    
    // Clear interval when component unmounts or stops
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      clearInterval(interval);
      setCurrentSongIndex(prevIndex => prevIndex + 1);
      playNextSong();
    }, songDuration);
  };

  // Stop auto-play
  const stopAutoPlay = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    setIsAutoPlaying(false);
    setCurrentSongIndex(0);
    setProgress(0);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f8ff'
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Kids Piano Game - Auto Play
      </Typography>
      
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2, width: '80%', maxWidth: 500 }}>
        {SONGS.map((song, index) => (
          <Button 
            key={index}
            variant="contained" 
            onClick={() => console.log(`Playing song ${index}: ${song.name}`)}
            sx={{ 
              backgroundColor: '#2196F3',
              height: 60,
              fontSize: '1.1rem'
            }}
          >
            {song.name} ({song.tempo} BPM)
          </Button>
        ))}
      </Box>
      
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={startAutoPlay}
          disabled={isAutoPlaying}
          sx={{ backgroundColor: '#4CAF50', height: 50, fontSize: '1.2rem' }}
        >
          {isAutoPlaying ? 'Auto Playing...' : 'Play All Songs Auto'}
        </Button>
        
        {isAutoPlaying && (
          <Button 
            variant="contained" 
            onClick={stopAutoPlay}
            sx={{ backgroundColor: '#FF5252', height: 50, fontSize: '1.1rem' }}
          >
            Stop Auto Play
          </Button>
        )}
      </Box>
      
      {isAutoPlaying && (
        <Box sx={{ mt: 4, width: '80%' }}>
          <Typography variant="body1" gutterBottom>
            Playing Song {currentSongIndex + 1} of {SONGS.length}
          </Typography>
          <Box sx={{ 
            height: 20, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 10,
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AutoPlayGame;