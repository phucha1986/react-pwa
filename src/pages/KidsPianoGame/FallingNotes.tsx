import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface Note {
  id: string;
  note: string;
  time: number;
  lane: number;
  status: 'pending' | 'hit' | 'missed';
  isBlackKey?: boolean;
}

interface FallingNotesProps {
  songNotes: { note: string; time: number }[];
  isPlaying: boolean;
  tempo: number;
}

const FallingNotes = ({ 
  songNotes, 
  isPlaying,
  tempo
}: FallingNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Calculate note speed based on tempo (faster for higher tempo)
  const noteSpeed = 150 + (tempo - 120) * 2;
  
  // Initialize notes when song data changes
  useEffect(() => {
    if (songNotes.length > 0 && isPlaying) {
      const newNotes: Note[] = songNotes.map((noteData, index) => ({
        id: `note-${index}-${Date.now()}`,
        note: noteData.note,
        time: 0, // Start at top
        lane: index % 10, // Simple lane assignment
        status: 'pending',
      }));
      setNotes(newNotes);
    } else {
      setNotes([]);
    }
  }, [songNotes, isPlaying]);

  // Animation loop for falling notes
  useEffect(() => {
    if (!isPlaying || notes.length === 0) return;

    const animate = () => {
      setNotes(prevNotes => {
        return prevNotes.map(note => {
          if (note.status !== 'pending') return note;
          
          // Update position based on speed and time
          const containerHeight = containerRef.current?.clientHeight || 400;
          const newTime = note.time + noteSpeed / 60; // Assuming 60fps
          
          if (newTime > containerHeight) {
            return { ...note, status: 'missed' };
          }
          
          return { ...note, time: newTime };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, notes.length, noteSpeed]);

  // Render a single falling note
  const renderNote = (note: Note) => {
    let backgroundColor = '#FFFFFF';
    let borderColor = '#888888';
    
    // Apply status-based styling
    switch (note.status) {
      case 'hit':
        backgroundColor = '#4CAF50';
        borderColor = '#388E3C';
        break;
      case 'missed':
        backgroundColor = '#F44336';
        borderColor = '#D32F2F';
        break;
      default:
        break;
    }
    
    return (
      <Box
        key={note.id}
        sx={{
          position: 'absolute',
          left: `${note.lane * 10}%`,
          top: `${note.time}px`, // Use the updated time for positioning
          width: '8%',
          height: '20px',
          backgroundColor,
          borderColor,
          borderRadius: '4px',
          borderStyle: 'solid',
          borderWidth: '2px',
          zIndex: 10,
        }}
      />
    );
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '80%',
        overflow: 'hidden',
        backgroundColor: '#f0f8ff',
        border: '2px solid #4C6EF5',
        borderRadius: '8px',
        margin: '10px 0',
      }}
    >
      {/* Hit line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: '#FFD700',
          boxShadow: '0 0 10px #FFD700',
          zIndex: 5,
        }}
      />
      
      {/* Render all falling notes */}
      {notes.map(renderNote)}
    </Box>
  );
};

export default FallingNotes;