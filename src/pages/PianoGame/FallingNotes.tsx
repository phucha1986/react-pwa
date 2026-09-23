import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface Note {
  id: string;
  note: string;
  time: number;
  lane: number;
  isBlackKey: boolean;
  status: 'pending' | 'hit' | 'missed';
}

interface FallingNotesProps {
  songNotes: { note: string; time: number }[];
  tempo: number;
  onNoteMissed: (noteId: string) => void;
}

const FallingNotes = ({ songNotes, tempo, onNoteMissed }: FallingNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hitLinePosition, setHitLinePosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Calculate note speed based on tempo
  const noteSpeed = 150 + (tempo - 120) * 2;

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      setHitLinePosition(containerHeight * 0.8);
    }
  }, []);

  // Initialize notes when song data changes
  useEffect(() => {
    if (songNotes.length > 0) {
      const newNotes: Note[] = songNotes.map((noteData, index) => ({
        id: `note-${index}-${Date.now()}`,
        note: noteData.note,
        time: noteData.time,
        lane: index % 10, // Simple lane assignment
        isBlackKey: index % 3 === 0, // Alternate black/white keys
        status: 'pending',
      }));
      setNotes(newNotes);
    }
  }, [songNotes]);

  // Animation loop for falling notes
  useEffect(() => {
    if (notes.length === 0) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;

      setNotes(prevNotes => {
        // Create a new array to avoid mutation
        const updatedNotes: Note[] = [];
        
        prevNotes.forEach(note => {
          if (note.status !== 'pending') {
            updatedNotes.push(note);
            return;
          }

          // Calculate how far the note should have fallen
          const timeSinceNoteCreated = elapsed - note.time;

          if (timeSinceNoteCreated < 0) {
            updatedNotes.push(note);
            return;
          }

          // Calculate vertical position based on note speed and time
          const notePosition = Math.min(
            hitLinePosition,
            (timeSinceNoteCreated / 1000) * noteSpeed
          );

          // Check if note has passed the hit line
          const distanceToHitLine = hitLinePosition - notePosition;

          if (distanceToHitLine <= 0) {
            // Note has passed the hit line - missed
            if (note.status === 'pending') {
              onNoteMissed(note.id);
              updatedNotes.push({ ...note, status: 'missed' });
            }
          } else {
            // Note is still falling
            updatedNotes.push(note);
          }
        });

        return updatedNotes.filter(note => note.status !== 'missed');
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [notes.length, hitLinePosition, tempo, noteSpeed, onNoteMissed]);

  // Render a single falling note
  const renderNote = (note: Note) => {
    const left = note.lane * 30; // Position based on lane
    let backgroundColor = note.isBlackKey ? '#222222' : '#FFFFFF';
    let borderColor = note.isBlackKey ? '#000000' : '#888888';

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
          left: `${left}px`,
          top: '0px',
          width: note.isBlackKey ? '20px' : '40px',
          height: '40px',
          backgroundColor,
          borderColor,
          borderRadius: note.isBlackKey ? '4px 4px 0 0' : '8px 8px 0 0',
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
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Hit line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: `${hitLinePosition}px`,
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