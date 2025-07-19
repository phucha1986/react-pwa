import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Container, Grid, TextField, Typography } from '@mui/material';

import elephantIcon from '../AnimalGame/logos/elephant.png';
import giraffeIcon from '../AnimalGame/logos/giraffe.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import monkeyIcon from '../AnimalGame/logos/monkey.png';
import parrotIcon from '../AnimalGame/logos/parrot.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';

// Animal data map
const animalData: Record<string, { word: string; icon: string }> = {
  lion: { word: 'LION', icon: lionIcon },
  elephant: { word: 'ELEPHANT', icon: elephantIcon },
  monkey: { word: 'MONKEY', icon: monkeyIcon },
  giraffe: { word: 'GIRAFFE', icon: giraffeIcon },
  parrot: { word: 'PARROT', icon: parrotIcon },
  turtle: { word: 'TURTLE', icon: turtleIcon },
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AnimalGuessPage() {
  const query = useQuery();
  const animalKey = query.get('animal')?.toLowerCase() || 'lion';

  const animal = useMemo(() => animalData[animalKey], [animalKey]);

  const word = animal?.word || '???';
  const [guess, setGuess] = useState(Array(word.length).fill(''));
  const [success, setSuccess] = useState(false);

  const handleInput = (value: string, index: number) => {
    const updated = [...guess];
    updated[index] = value.toUpperCase().slice(0, 1);
    setGuess(updated);

    if (updated.join('') === word) {
      setSuccess(true);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFCEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 6,
        gap: 4,
      }}
    >
      <Box component="img" src={animal?.icon} alt={animalKey} sx={{ width: 180, height: 180 }} />

      <Grid container spacing={2} justifyContent="center">
        {guess.map((char, i) => (
          <Grid item key={i}>
            <TextField
              value={char}
              onChange={(e) => handleInput(e.target.value, i)}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: 36,
                  width: '60px',
                  height: '60px',
                },
                maxLength: 1,
              }}
              disabled={success}
              variant="outlined"
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </Grid>
        ))}
      </Grid>

      {success && (
        <Typography variant="h4" color="green" fontWeight="bold">
          🎉 Great Job! It's {word}!
        </Typography>
      )}
    </Container>
  );
}
