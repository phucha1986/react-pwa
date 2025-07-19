import { useNavigate } from 'react-router-dom';

import { Box, Container, Stack, Typography } from '@mui/material';

import letsPlayIcon from './logos/blocks.png';
import settingsIcon from './logos/settings.png';
import leaderboardIcon from './logos/trophy.png';

const menuItems = [
  { label: 'Let’s Play', image: letsPlayIcon, to: '/AnimalGame', bg: '#FFD93D' },
  { label: 'Leaderboard', image: leaderboardIcon, to: '/leaderboard', bg: '#6BCB77' },
  { label: 'Settings', image: settingsIcon, to: '/settings', bg: '#4D96FF' },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFCEB',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack spacing={4} width="100%" alignItems="center">
        {menuItems.map(({ label, image, to, bg }) => (
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
            <Box
              component="img"
              src={image}
              alt={label}
              sx={{
                width: 48,
                height: 48,
                mb: 1,
              }}
            />
            <Typography variant="h6" fontWeight="bold" color="#333">
              {label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
