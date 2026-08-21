import { useNavigate } from 'react-router';

import { Container, Grid, Paper } from '@mui/material';

import antIcon from './logos/ant.png';
import catIcon from './logos/cat.png';
import cowIcon from './logos/cow.png';
import crocodileIcon from './logos/crocodile.png';
import dogIcon from './logos/dog.png';
import eagleIcon from './logos/eagle.png';
import elephantIcon from './logos/elephant.png';
import flamingoIcon from './logos/flamingo.png';
import frogIcon from './logos/frog.png';
import giraffeIcon from './logos/giraffe.png';
import goatIcon from './logos/goat.png';
import horseIcon from './logos/horse.png';
import hummingbirdIcon from './logos/hummingbird.png';
import leopardIcon from './logos/leopard.png';
import lionIcon from './logos/lion.png';
import monkeyIcon from './logos/monkey.png';
import octopusIcon from './logos/octopus.png';
import orangutanIcon from './logos/orangutan.png';
import ostrichIcon from './logos/ostrich.png';
import parrotIcon from './logos/parrot.png';
import penguinIcon from './logos/penguin.png';
import rabbitIcon from './logos/rabbit.png';
import reindeerIcon from './logos/reindeer.png';
import sealIcon from './logos/seal.png';
import squirrelIcon from './logos/squirrel.png';
import tigerIcon from './logos/tiger.png';
import turtleIcon from './logos/turtle.png';
import whaleIcon from './logos/whale.png';
import yakIcon from './logos/yak.png';
import zebraIcon from './logos/zebra.png';
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
    { src: dogIcon, alt: 'Dog', bg: '#FFD93D' },
    { src: catIcon, alt: 'Cat', bg: '#FFADAD' },
    { src: cowIcon, alt: 'Cow', bg: '#A0E7E5' },
    { src: horseIcon, alt: 'Horse', bg: '#FFD93D' },
    { src: goatIcon, alt: 'Goat', bg: '#6BCB77' },
    { src: whaleIcon, alt: 'Whale', bg: '#4D96FF' },
    { src: tigerIcon, alt: 'Tiger', bg: '#FF6B6B' },
    { src: rabbitIcon, alt: 'Rabbit', bg: '#FFADAD' },
    { src: octopusIcon, alt: 'Octopus', bg: '#FF6B6B' },
    { src: zebraIcon, alt: 'Zebra', bg: '#FFD93D' },
    { src: eagleIcon, alt: 'Eagle', bg: '#4D96FF' },
    { src: crocodileIcon, alt: 'Crocodile', bg: '#6BCB77' },
    { src: penguinIcon, alt: 'Penguin', bg: '#A0E7E5' },
    { src: ostrichIcon, alt: 'Ostrich', bg: '#FFD93D' },
    { src: sealIcon, alt: 'Seal', bg: '#A0E7E5' },
    { src: flamingoIcon, alt: 'Flamingo', bg: '#FFADAD' },
    { src: leopardIcon, alt: 'Leopard', bg: '#FFD93D' },
    { src: antIcon, alt: 'Ant', bg: '#FF6B6B' },
    { src: squirrelIcon, alt: 'Squirrel', bg: '#FFD93D' },
    { src: frogIcon, alt: 'Frog', bg: '#6BCB77' },
    { src: hummingbirdIcon, alt: 'Hummingbird', bg: '#4D96FF' },
    { src: orangutanIcon, alt: 'Orangutan', bg: '#FF6B6B' },
    { src: yakIcon, alt: 'Yak', bg: '#A0E7E5' },
    { src: reindeerIcon, alt: 'Reindeer', bg: '#FFD93D' },
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
