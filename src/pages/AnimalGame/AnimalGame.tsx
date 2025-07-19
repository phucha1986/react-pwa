import { useNavigate } from 'react-router';

import { Container, Grid, Paper } from '@mui/material';

import elephantIcon from './logos/elephant.png';
import giraffeIcon from './logos/giraffe.png';
import lionIcon from './logos/lion.png';
import monkeyIcon from './logos/monkey.png';
import parrotIcon from './logos/parrot.png';
import turtleIcon from './logos/turtle.png';
import { Image } from './styled';

// Assuming this is a styled img component

function Welcome() {
  const animals = [
    { src: lionIcon, alt: 'Lion', bg: '#FFD93D' },
    { src: elephantIcon, alt: 'Elephant', bg: '#6BCB77' },
    { src: monkeyIcon, alt: 'Monkey', bg: '#FF6B6B' },
    { src: giraffeIcon, alt: 'Giraffe', bg: '#4D96FF' },
    { src: parrotIcon, alt: 'Parrot', bg: '#FFADAD' },
    { src: turtleIcon, alt: 'Turtle', bg: '#A0E7E5' },
  ];

  const navigate = useNavigate();

  const handleNavigate = (animalName: string) => {
    navigate(`/AnimalGuessPage?animal=${encodeURIComponent(animalName)}`);
  };

  return (
    <>
      <meta name="title" content="Welcome to Jungle!" />
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '100vh',
          bgcolor: '#FFFCEB',
          py: 4,
        }}
      >
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          {animals.map((animal) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              key={animal.alt}
              onClick={() => handleNavigate(animal.alt)}
            >
              <Paper
                elevation={6}
                sx={{
                  bgcolor: animal.bg,
                  borderRadius: '2rem',
                  p: 2,
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    cursor: 'pointer',
                  },
                }}
              >
                <Image
                  src={animal.src}
                  alt={animal.alt}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default Welcome;
