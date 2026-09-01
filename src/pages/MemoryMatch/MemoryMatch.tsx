import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import catIcon from '../AnimalGame/logos/cat.png';
import dogIcon from '../AnimalGame/logos/dog.png';
import elephantIcon from '../AnimalGame/logos/elephant.png';
import frogIcon from '../AnimalGame/logos/frog.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import rabbitIcon from '../AnimalGame/logos/rabbit.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';
import { playFlip, playMatch, playMismatch, playWin } from './sound';

type Card = {
  id: number;
  animal: string;
  src: string;
  bg: string;
};

const ANIMALS = [
  { animal: 'cat', src: catIcon, bg: '#FFADAD' },
  { animal: 'dog', src: dogIcon, bg: '#FFD93D' },
  { animal: 'elephant', src: elephantIcon, bg: '#6BCB77' },
  { animal: 'frog', src: frogIcon, bg: '#A0E7E5' },
  { animal: 'lion', src: lionIcon, bg: '#FFD93D' },
  { animal: 'rabbit', src: rabbitIcon, bg: '#FFADAD' },
  { animal: 'turtle', src: turtleIcon, bg: '#4D96FF' },
];

function buildDeck(): Card[] {
  // Pick 6 animals -> 12 cards (6 pairs), shuffled.
  const chosen = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 6);
  const doubled = chosen.flatMap((a) => [a, a]);
  const shuffled = doubled.sort(() => Math.random() - 0.5);
  return shuffled.map((a, i) => ({ id: i, animal: a.animal, src: a.src, bg: a.bg }));
}

export default function MemoryMatch() {
  const { t } = useLanguage();

  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const totalPairs = deck.length / 2;
  const foundPairs = matched.size;
  const won = foundPairs === totalPairs;

  const reset = useCallback(() => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
  }, []);

  const handleFlip = (id: number) => {
    if (lock) return;
    if (flipped.includes(id)) return;
    if (matched.has(deck[id].animal)) return;

    playFlip();
    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].animal === deck[b].animal) {
        // Match!
        setLock(true);
        window.setTimeout(() => {
          playMatch();
          setMatched((prev) => new Set(prev).add(deck[a].animal));
          setFlipped([]);
          setLock(false);
        }, 350);
      } else {
        // Mismatch — flip back after a beat.
        setLock(true);
        window.setTimeout(() => {
          playMismatch();
          setFlipped([]);
          setLock(false);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (won) playWin();
  }, [won]);

  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.75rem',
      width: '100%',
      maxWidth: 560,
      margin: '0 auto',
    }),
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
      <Stack spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#4D96FF' }}>
          {t.memoryTitle}
        </Typography>
        <Typography variant="body1" sx={{ color: '#8a7a5c', textAlign: 'center' }}>
          {t.memoryHint}
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
            {t.memoryPairs}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#6BCB77' }}>
            {foundPairs}/{totalPairs}
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
            {t.memoryMoves}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6B6B' }}>
            {moves}
          </Typography>
        </Box>
      </Stack>

      <Box sx={gridStyle}>
        {deck.map((card, i) => {
          const isUp = flipped.includes(i) || matched.has(card.animal);
          const isMatched = matched.has(card.animal);
          return (
            <Box
              key={card.id}
              onClick={() => handleFlip(i)}
              sx={{
                aspectRatio: '1 / 1',
                perspective: '800px',
                cursor: isUp ? 'default' : 'pointer',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.45s',
                  transform: isUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Back (face down) */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: '1rem',
                    bgcolor: '#4D96FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                    fontSize: '2rem',
                  }}
                >
                  ❓
                </Box>
                {/* Front (face up) */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '1rem',
                    bgcolor: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isMatched ? 0 : 3,
                    outline: isMatched ? '4px solid #6BCB77' : 'none',
                    opacity: isMatched ? 0.85 : 1,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <img
                    src={card.src}
                    alt={card.animal}
                    style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {won && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#6BCB77' }}>
            {t.memoryWin}
          </Typography>
        </Box>
      )}

      <Stack alignItems="center" sx={{ mt: 3 }}>
        <Button
          onClick={reset}
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#FF6B6B',
            color: '#fff',
            fontWeight: 800,
            px: 4,
            py: 1.5,
            borderRadius: '2rem',
            boxShadow: 3,
            '&:hover': { bgcolor: '#ff5252' },
          }}
        >
          {t.memoryPlayAgain}
        </Button>
      </Stack>
    </Container>
  );
}
