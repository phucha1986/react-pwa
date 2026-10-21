import { useNavigate } from 'react-router';

import { Container, Grid, Paper } from '@mui/material';

import appleImg from './logos/apple.png';
import avocadoImg from './logos/avocado.png';
import bananaImg from './logos/banana.png';
import blueberryImg from './logos/blueberry.png';
import cherryImg from './logos/cherry.png';
import coconutImg from './logos/coconut.png';
import grapeImg from './logos/grape.png';
import kiwiImg from './logos/kiwi.png';
import lemonImg from './logos/lemon.png';
import mangoImg from './logos/mango.png';
import melonImg from './logos/melon.png';
import oliveImg from './logos/olive.png';
import orangeImg from './logos/orange.png';
import peachImg from './logos/peach.png';
import pearImg from './logos/pear.png';
import pineappleImg from './logos/pineapple.png';
import strawberryImg from './logos/strawberry.png';
import watermelonImg from './logos/watermelon.png';

const fruits = [
  { icon: appleImg, alt: 'Apple', bg: '#FFADAD' },
  { icon: bananaImg, alt: 'Banana', bg: '#FFD93D' },
  { icon: cherryImg, alt: 'Cherry', bg: '#FFD6E0' },
  { icon: grapeImg, alt: 'Grape', bg: '#E8D6FF' },
  { icon: lemonImg, alt: 'Lemon', bg: '#FFF3C4' },
  { icon: mangoImg, alt: 'Mango', bg: '#FFE5CC' },
  { icon: orangeImg, alt: 'Orange', bg: '#FFE5CC' },
  { icon: peachImg, alt: 'Peach', bg: '#FFD6E0' },
  { icon: pearImg, alt: 'Pear', bg: '#D9F2E3' },
  { icon: pineappleImg, alt: 'Pineapple', bg: '#FFD93D' },
  { icon: strawberryImg, alt: 'Strawberry', bg: '#FFADAD' },
  { icon: watermelonImg, alt: 'Watermelon', bg: '#A0E7E5' },
  { icon: kiwiImg, alt: 'Kiwi', bg: '#D9F2E3' },
  { icon: coconutImg, alt: 'Coconut', bg: '#FFE5CC' },
  { icon: blueberryImg, alt: 'Blueberry', bg: '#D6E9FF' },
  { icon: melonImg, alt: 'Melon', bg: '#D9F2E3' },
  { icon: avocadoImg, alt: 'Avocado', bg: '#D9F2E3' },
  { icon: oliveImg, alt: 'Olive', bg: '#E8D6FF' },
];

function FruitGame() {
  const navigate = useNavigate();

  const handleNavigate = (fruitName: string) => {
    navigate(`/FruitGuessPage?fruit=${encodeURIComponent(fruitName)}`);
  };

  return (
    <>
      <meta name="title" content="Welcome to the Orchard!" />
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '100vh',
          bgcolor: '#FFFCEB',
          py: 4,
        }}
      >
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          {fruits.map((fruit) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              key={fruit.alt}
              onClick={() => handleNavigate(fruit.alt)}
            >
              <Paper
                elevation={6}
                sx={{
                  bgcolor: fruit.bg,
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
                  userSelect: 'none',
                  '& img': {
                    width: 'clamp(64px, 16vw, 128px)',
                    height: 'auto',
                    display: 'block',
                  },
                }}
              >
                <img src={fruit.icon} alt={fruit.alt} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default FruitGame;
