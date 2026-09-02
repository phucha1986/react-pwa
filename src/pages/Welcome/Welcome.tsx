import { useNavigate } from 'react-router-dom';

import { Box, Container, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import catIcon from '../AnimalGame/logos/cat.png';
import dogIcon from '../AnimalGame/logos/dog.png';
import elephantIcon from '../AnimalGame/logos/elephant.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import rabbitIcon from '../AnimalGame/logos/rabbit.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';
import coloringIcon from './logos/coloring.svg';
import pianoIcon from './logos/piano.svg';

const flappyBirdSprite =
  'https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/yellowbird-midflap.png';

const menuItems = [
  { images: [lionIcon, elephantIcon], to: '/AnimalGame', bg: '#FFD93D' },
  { label: 'Flappy Bird', image: flappyBirdSprite, to: '/FlappyBird', bg: '#FFADAD' },
  { label: 'Piano', image: pianoIcon, to: '/PianoGame', bg: '#B197FC' },
  { label: 'Coloring', image: coloringIcon, to: '/ColoringGame', bg: '#FFA94D' },
  { images: [rabbitIcon, turtleIcon], to: '/MemoryMatch', bg: '#A0E7E5', labelKey: 'memoryTitle' },
  { images: [catIcon, dogIcon], to: '/WhackAMole', bg: '#FFD8A8', labelKey: 'whackTitle' },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFCEB',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={4} width="100%" alignItems="center" sx={{ margin: 'auto' }}>
        {menuItems.map((item) => {
          const label =
            'label' in item ? item.label : 'labelKey' in item ? t[item.labelKey] : t.animalsTitle;
          const images = 'images' in item ? item.images : item.image ? [item.image] : [];
          const { to, bg } = item;
          return (
            <Box
              key={label}
              onClick={() => navigate(to)}
              sx={{
                width: '100%',
                maxWidth: 360,
                height: 140,
                bgcolor: bg,
                borderRadius: '2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {images?.map((src, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={src}
                    alt={label}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />
                ))}
              </Stack>
              <Typography variant="h6" fontWeight="bold" color="#333">
                {label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Container>
  );
}
