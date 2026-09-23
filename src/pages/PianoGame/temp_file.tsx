import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, IconButton, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { playPianoNoteEnhanced } from './sound';

// Piano keys for 5-year-olds (C4 to G5: 10 white keys + 7 black keys)
const WHITE_KEYS = [
  { note: 'C', freq: 261.63, color: '#FFFFFF' }, // C4
  { note: 'D', freq: 293.66, color: '#FFFFFF' }, // D4
  { note: 'E', freq: 329.63, color: '#FFFFFF' }, // E4
  { note: 'F', freq: 349.23, color: '#FFFFFF' }, // F4
  { note: 'G', freq: 392.00, color: '#FFFFFF' }, // G4
  { note: 'A', freq: 440.00, color: '#FFFFFF' }, // A4
  { note: 'B', freq: 493.88, color: '#FFFFFF' }, // B4
  { note: 'C', freq: 523.25, color: '#FFFFFF' }, // C5
  { note: 'D', freq: 587.33, color: '#FFFFFF' }, // D5
  { note: 'E', freq: 659.25, color: '#FFFFFF' }, // E5
];

const BLACK_KEYS = [
  { note: 'C#', freq: 277.18, color: '#222222' }, // C#4
  { note: 'D#', freq: 311.13, color: '#222222' }, // D#4
  { note: 'F#', freq: 369.99, color: '#222222' }, // F#4
  { note: 'G#', freq: 415.30, color: '#222222' }, // G#4
  { note: 'A#', freq: 466.16, color: '#222222' }, // A#4
  { note: 'C#', freq: 554.37, color: '#222222' }, // C#5
  { note: 'D#', freq: 622.25, color: '#222222' }, // D#5
];

// Enhanced visual feedback for 5-year-olds with animations and effects
const PianoGame = () => {
  const { t } = useLanguage();
  
  const [sustainPedal, setSustainPedal] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [octave, setOctave] = useState(0); // 0 for C4-G5 range
  const [activeKeys, setActiveKeys] = useState<Record<number, boolean>>({});
  
  const sustainNotesRef = useRef<Record<number, number>>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as typeof window).AudioContext)();
    }
  }, []);

  // Handle key press with enhanced visual feedback
  const pressKey = useCallback((keyIndex: number, isBlackKey: boolean = false) => {
    initAudioContext();
    
    // Play the piano note with realistic sound
    let freq = WHITE_KEYS[keyIndex].freq;
    if (isBlackKey && keyIndex < BLACK_KEYS.length) {
      freq = BLACK_KEYS[keyIndex].freq;
    }
    
    // Apply octave shift
    const adjustedFreq = freq * Math.pow(2, octave);
    
    // Play the note with volume control
    playPianoNoteEnhanced(adjustedFreq, volume);
    
    // Handle sustain pedal
    if (sustainPedal) {
      sustainNotesRef.current[keyIndex] = performance.now();
    }
    
    // Update active keys for visual feedback
    setActiveKeys(prev => ({ ...prev, [keyIndex]: true }));
  }, [octave, sustainPedal, initAudioContext, volume]);

  // Handle key release with enhanced visual feedback
  const releaseKey = useCallback((keyIndex: number) => {
    setActiveKeys(prev => ({ ...prev, [keyIndex]: false }));
    
    if (sustainPedal && sustainNotesRef.current[keyIndex]) {
      delete sustainNotesRef.current[keyIndex];
    }
  }, [sustainPedal]);

  // Handle octave change
  const changeOctave = (direction: 'up' | 'down') => {
    if (direction === 'up' && octave < 2) {
      setOctave(octave + 1);
    } else if (direction === 'down' && octave > -2) {
      setOctave(octave - 1);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  // Calculate key sizes based on screen width for responsive design
  const calculateKeySizes = () => {
    const screenWidth = window.innerWidth;
    // Ensure minimum size of 55px and maximum of 80px
    const whiteKeyWidth = Math.min(Math.max(55, screenWidth / 10), 80);
    const blackKeyWidth = whiteKeyWidth * 0.6; 
    const blackKeyHeight = whiteKeyWidth * 0.6;
    
    return {
      whiteKeyWidth,
      blackKeyWidth,
      blackKeyHeight
    };
  };

  // Use state to force re-render on resize for key size calculation
  const [keySizes, setKeySizes] = useState(calculateKeySizes());
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setKeySizes(calculateKeySizes());
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { whiteKeyWidth, blackKeyWidth, blackKeyHeight } = keySizes;

  // Prevent scrolling when touching piano keys
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && 
          (e.target.closest('.piano-key') || e.target.closest('.piano-control'))) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Add animation styles for key press effects
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes bounce {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      
      @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(76, 110, 245, 0.7); }
        50% { box-shadow: 0 0 20px rgba(76, 110, 245, 0.9); }
        100% { box-shadow: 0 0 5px rgba(76, 110, 245, 0.7); }
      }
      
      .piano-key.active {
        animation: bounce 0.2s ease, glow 0.5s ease;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #74B9FF 0%, #A8D8FF 55%, #DFF3FF 100%)',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Main content container */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top title bar */}
        <Box
          sx={{
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderBottom: '2px solid rgba(255,255,255,0.7)',
          }}
        >
          <Typography variant="h4" fontWeight={900} color="#4C6EF5">
            🎹 {t.pianoTitle}
          </Typography>
        </Box>
        
         {/* Piano keys area */}
         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Box sx={{ display: 'flex', position: 'relative', height: '70%', width: '90%' }}>
             {/* White keys */}
             {WHITE_KEYS.map((key, index) => (
               <Box
                 key={index}
                 className="piano-key"
                 sx={{
                   width: whiteKeyWidth,
                   height: '100%',
                   backgroundColor: activeKeys[index] ? '#a0d2eb' : '#fff',
                   border: '1px solid #ccc',
                   borderRadius: '0 0 8px 8px',
                   position: 'relative',
                   zIndex: 1,
                   display: 'flex',
                   alignItems: 'flex-end',
                   justifyContent: 'center',
                   pb: 2,
                   transition: 'background-color 0.1s ease',
                   cursor: 'pointer',
                   boxShadow: activeKeys[index] ? '0 0 15px rgba(76, 110, 245, 0.7)' : '0 4px 0 rgba(0,0,0,0.18)',
                   animation: activeKeys[index] ? 'bounce 0.2s ease' : 'none',
                 }}
                 onMouseDown={() => pressKey(index, false)}
                 onMouseUp={() => releaseKey(index)}
                 onMouseLeave={() => releaseKey(index)}
                 onTouchStart={(e) => {
                   e.preventDefault();
                   pressKey(index, false);
                 }}
                 onTouchEnd={() => releaseKey(index)}
               >
                 <Typography
                   sx={{
                     color: activeKeys[index] ? '#4C6EF5' : '#333',
                     fontWeight: 'bold',
                     fontSize: 16,
                     textShadow: '0 0 4px rgba(0,0,0,0.5)',
                   }}
                 >
                   {key.note}
                 </Typography>
               </Box>
             ))}
             
             {/* Black keys */}
             {BLACK_KEYS.map((key, index) => {
               // Position black keys between white keys
               const positionOffset = (index * 2 + 1) * (whiteKeyWidth / 2) - blackKeyWidth / 2;
               
               return (
                 <Box
                   key={index}
                   className="piano-key"
                   sx={{
                     width: blackKeyWidth,
                     height: blackKeyHeight,
                     backgroundColor: activeKeys[index + 10] ? '#333' : '#000', // +10 to account for white keys
                     border: '1px solid #333',
                     borderRadius: '0 0 6px 6px',
                     position: 'absolute',
                     left: `${positionOffset}px`,
                     zIndex: 2,
                     display: 'flex',
                     alignItems: 'flex-end',
                     justifyContent: 'center',
                     pb: 2,
                     transition: 'background-color 0.1s ease',
                     cursor: 'pointer',
                     boxShadow: activeKeys[index + 10] ? '0 0 15px rgba(0,0,0,0.5)' : '0 4px 0 rgba(0,0,0,0.3)',
                     animation: activeKeys[index + 10] ? 'bounce 0.2s ease' : 'none',
                   }}
                   onMouseDown={() => pressKey(index + 10, true)}
                   onMouseUp={() => releaseKey(index + 10)}
                   onMouseLeave={() => releaseKey(index + 10)}
                   onTouchStart={(e) => {
                     e.preventDefault();
                     pressKey(index + 10, true);
                   }}
                   onTouchEnd={() => releaseKey(index + 10)}
                 >
                   <Typography
                     sx={{
                       color: activeKeys[index + 10] ? '#fff' : '#ddd',
                       fontWeight: 'bold',
                       fontSize: 12,
                       textShadow: '0 0 4px rgba(0,0,0,0.5)',
                     }}
                   >
                     {key.note}
                   </Typography>
                 </Box>
               );
             })}
           </Box>
         </div>
        
         {/* Controls and hint */}
         <Box
           sx={{
             height: 'auto',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             px: 2,
             py: 1,
             bgcolor: 'rgba(255,255,255,0.9)',
             borderTop: '2px solid rgba(255,255,255,0.7)',
           }}
         >
           <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
             {/* Octave controls */}
             <IconButton
               onClick={() => changeOctave('down')}
               disabled={octave <= -2}
               className="piano-control"
               sx={{
                 backgroundColor: '#4C6EF5',
                 color: '#fff',
                 '&:hover': { backgroundColor: '#3a57c0' },
                 width: 50,
                 height: 50,
                 borderRadius: '50%',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
               }}
             >
               <Typography fontSize={24} fontWeight={900}>-</Typography>
             </IconButton>
             
             <Typography
               sx={{
                 display: 'flex',
                 alignItems: 'center',
                 backgroundColor: '#4C6EF5',
                 color: '#fff',
                 borderRadius: '25px',
                 px: 2,
                 py: 1,
                 fontWeight: 'bold',
                 fontSize: 16,
               }}
             >
               Octave {octave > 0 ? `+${octave}` : octave}
             </Typography>
             
             <IconButton
               onClick={() => changeOctave('up')}
               disabled={octave >= 2}
               className="piano-control"
               sx={{
                 backgroundColor: '#4C6EF5',
                 color: '#fff',
                 '&:hover': { backgroundColor: '#3a57c0' },
                 width: 50,
                 height: 50,
                 borderRadius: '50%',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
               }}
             >
               <Typography fontSize={24} fontWeight={900}>+</Typography>
             </IconButton>
           </Box>
           
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
             <Typography sx={{ fontSize: 18, color: '#4C6EF5' }}>🔊</Typography>
             <input
               type="range"
               min="0"
               max="1"
               step="0.01"
               value={volume}
               onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
               style={{ 
                 width: '120px',
                 height: 15,
                 WebkitAppearance: 'none',
                 backgroundColor: 'rgba(200,200,200,0.5)',
                 borderRadius: '10px',
                 outline: 'none',
               }}
             />
             <Typography sx={{ fontSize: 16, color: '#4C6EF5' }}>{Math.round(volume * 100)}%</Typography>
           </Box>
           
           {/* Sustain pedal */}
           <IconButton
             onClick={() => setSustainPedal(!sustainPedal)}
             className="piano-control"
             sx={{
               backgroundColor: sustainPedal ? '#ff6b6b' : '#4C6EF5',
               color: '#fff',
               '&:hover': { backgroundColor: sustainPedal ? '#e05a5a' : '#3a57c0' },
               width: 60,
               height: 60,
               borderRadius: '50%',
               boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
             }}
           >
             <Typography fontSize={30} fontWeight={900}>
               {sustainPedal ? '😊' : '😌'}
             </Typography>
           </IconButton>
         </Box>
        
        {/* Bottom hint */}
        <Box
          sx={{
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderTop: '2px solid rgba(255,255,255,0.7)',
          }}
        >
          <Typography sx={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            {t.pianoHint}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PianoGame;
