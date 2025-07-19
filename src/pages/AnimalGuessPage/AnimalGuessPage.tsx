import { useState } from 'react';

import { Box, Container, Grid, TextField, Typography } from '@mui/material';

import lionIcon from '../AnimalGame/logos/lion.png';

const word = 'LION';

export default function AnimalGuessPage() {
  const [guess, setGuess] = useState(Array(word.length).fill(''));
  const [success, setSuccess] = useState(false);

  const handleInput = (value: string, index: number) => {
    const updated = [...guess];
    updated[index] = value.toUpperCase().slice(0, 1); // one char only
    setGuess(updated);

    if (updated.join('') === word) {
      setSuccess(true);
      // trigger animation or sound here
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
      <Box component="img" src={lionIcon} alt="Lion" sx={{ width: 180, height: 180 }} />

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
          🎉 Great Job! It's LION!
        </Typography>
      )}
    </Container>
  );
}
