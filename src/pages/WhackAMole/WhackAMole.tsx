import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import rabbitIcon from '../AnimalGame/logos/rabbit.png';
import { playGameOver, playWhack, playWin } from './sound';

const GAME_SECONDS = 30;
const SPAWN_MS = 650;
const HOLES = 9;

const MOLES = [rabbitIcon];

type Phase = 'idle' | 'playing' | 'over';

export default function WhackAMole() {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [mole, setMole] = useState<{ hole: number; src: string } | null>(null);
  const [whacked, setWhacked] = useState(false);

  const whackTimer = useRef<number | null>(null);

  const start = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setMole(null);
    setWhacked(false);
    setPhase('playing');
  }, []);

  // Countdown.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // End of game.
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      setPhase('over');
      setMole(null);
      window.setTimeout(() => (score > 0 ? playWin() : playGameOver()), 150);
    }
  }, [phase, timeLeft, score]);

  // Mole spawner.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setMole({
        hole: Math.floor(Math.random() * HOLES),
        src: MOLES[Math.floor(Math.random() * MOLES.length)],
      });
    }, SPAWN_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(
    () => () => {
      if (whackTimer.current) window.clearTimeout(whackTimer.current);
    },
    [],
  );

  const handleWhack = (hole: number) => {
    if (phase !== 'playing' || !mole || mole.hole !== hole) return;
    playWhack();
    setScore((s) => s + 1);
    setWhacked(true);
    if (whackTimer.current) window.clearTimeout(whackTimer.current);
    whackTimer.current = window.setTimeout(() => {
      setMole(null);
      setWhacked(false);
    }, 500);
  };

  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.75rem',
      width: '100%',
      maxWidth: 420,
      margin: '0 auto',
    }),
    [],
  );

  const whackKeyframes = useMemo(
    () => `
@keyframes rabbitWhack {
  0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
  25%  { transform: translateY(-38%) scale(1.15, 0.9) rotate(-14deg); opacity: 1; }
  50%  { transform: translateY(0) scale(0.9, 1.1) rotate(10deg); opacity: 1; }
  70%  { transform: translateY(-18%) scale(1.05) rotate(-6deg); opacity: 1; }
  100% { transform: translateY(30%) scale(0.7) rotate(0deg); opacity: 0; }
}`,
    [],
  );

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFCEB',
        py: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{whackKeyframes}</style>
      <Stack spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#FF922B' }}>
          {t.whackTitle}
        </Typography>
        <Typography variant="body1" sx={{ color: '#8a7a5c', textAlign: 'center' }}>
          {t.whackHint}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '1rem',
            px: 2,
            py: 0.75,
            boxShadow: 2,
            textAlign: 'center',
            minWidth: 90,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t.whackScore}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#6BCB77' }}>
            {score}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '1rem',
            px: 2,
            py: 0.75,
            boxShadow: 2,
            textAlign: 'center',
            minWidth: 90,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t.whackTime}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: timeLeft <= 5 && phase === 'playing' ? '#FF6B6B' : '#4D96FF',
            }}
          >
            {timeLeft}s
          </Typography>
        </Box>
      </Stack>

      <Box sx={gridStyle}>
        {Array.from({ length: HOLES }, (_, i) => {
          const isHere = mole?.hole === i;
          return (
            <Box
              key={i}
              onClick={() => handleWhack(i)}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                bgcolor: '#8a5a2b',
                boxShadow: 'inset 0 8px 14px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: isHere ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              {isHere && mole && (
                <Box
                  component="img"
                  src={mole.src}
                  alt=""
                  sx={{
                    width: '95%',
                    transform: 'translateY(0%)',
                    animation: whacked ? 'rabbitWhack 0.5s ease-out forwards' : 'none',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      <Stack alignItems="center" sx={{ mt: 3 }}>
        {phase === 'idle' && (
          <Button
            onClick={start}
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#FF922B',
              color: '#fff',
              fontWeight: 800,
              px: 4,
              py: 1.2,
              borderRadius: '2rem',
              boxShadow: 3,
              '&:hover': { bgcolor: '#f76707' },
            }}
          >
            {t.whackPlayAgain}
          </Button>
        )}
        {phase === 'over' && (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#4D96FF' }}>
              {t.whackGameOver} — {score}
            </Typography>
            <Button
              onClick={start}
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#FF922B',
                color: '#fff',
                fontWeight: 800,
                px: 4,
                py: 1.2,
                borderRadius: '2rem',
                boxShadow: 3,
                '&:hover': { bgcolor: '#f76707' },
              }}
            >
              {t.whackPlayAgain}
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
