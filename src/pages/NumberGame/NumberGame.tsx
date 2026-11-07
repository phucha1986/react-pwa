import { useEffect, useMemo, useState } from 'react';

import { Box, Container, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { playCorrect, playSparkle, playTap, playWin, playWrong, speak } from './sound';

// Gentle difficulty ladder: the grid and number range grow as the kid scores.
// Start tiny (2x2, numbers 0-3) so a 4-year-old can succeed, then ramp up slowly
// and cap the board at 3x3 so it stays easy to scan for little ones.
const LEVELS = [
  { cols: 2, rows: 2, max: 4 },
  { cols: 3, rows: 2, max: 6 },
  { cols: 3, rows: 3, max: 10 },
];
const LEVEL_UP_EVERY = 5;
const WIN_EVERY = 5;

const PALETTE = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#B197FC',
  '#FFA94D',
  '#A0E7E5',
  '#FFC2D4',
];

// Playful, rounded font for the big kid numbers (falls back gracefully offline).
const FUN_FONT =
  "'Baloo 2', 'Fredoka', 'Comic Sans MS', 'Chewie', 'Baloo', 'Segoe UI Rounded', cursive";

type Tile = { value: number; bg: string };

function levelForScore(score: number): number {
  return Math.min(Math.floor(score / LEVEL_UP_EVERY), LEVELS.length - 1);
}

function buildRound(level: number): { target: number; tiles: Tile[]; cols: number } {
  const { cols, rows, max } = LEVELS[level];
  const count = cols * rows;
  const target = Math.floor(Math.random() * max);
  const targetPos = Math.floor(Math.random() * count);
  const tiles: Tile[] = [];
  for (let i = 0; i < count; i++) {
    if (i === targetPos) {
      tiles.push({ value: target, bg: PALETTE[i % PALETTE.length] });
    } else {
      let value = Math.floor(Math.random() * max);
      while (value === target) value = Math.floor(Math.random() * max);
      tiles.push({ value, bg: PALETTE[(i + 3) % PALETTE.length] });
    }
  }
  return { target, tiles, cols };
}

export default function NumberGame() {
  const { t, lang } = useLanguage();

  const [round, setRound] = useState<{ target: number; tiles: Tile[]; cols: number }>(() =>
    buildRound(0),
  );
  const [score, setScore] = useState(0);
  const [found, setFound] = useState(false);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const { target, tiles, cols } = round;
  const level = levelForScore(score);

  const handleTap = (i: number) => {
    if (found) return;
    const tile = tiles[i];
    if (!tile) return;
    playTap();
    if (tile.value === target) {
      playCorrect();
      playSparkle();
      setFound(true);
      setScore((s) => s + 1);
    } else {
      playWrong();
      setWrongIndex(i);
    }
  };

  // Clear the "wrong" wiggle a beat after a mis-tap.
  useEffect(() => {
    if (wrongIndex === null) return;
    const id = window.setTimeout(() => setWrongIndex(null), 500);
    return () => window.clearTimeout(id);
  }, [wrongIndex]);

  // Celebrate a milestone every few finds.
  useEffect(() => {
    if (score > 0 && score % WIN_EVERY === 0) playWin();
  }, [score]);

  // Once the kid finds it, show a fresh board after a happy pause.
  useEffect(() => {
    if (!found) return;
    const id = window.setTimeout(() => {
      setRound(buildRound(level));
      setFound(false);
      setWrongIndex(null);
    }, 900);
    return () => window.clearTimeout(id);
  }, [found, level]);

  // Narrate the target number aloud whenever a new round is shown.
  useEffect(() => {
    speak(t.numberSay(target), lang);
  }, [round, target, lang, t]);

  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '1rem',
      width: '100%',
      maxWidth: 720,
      margin: '0 auto',
    }),
    [cols],
  );

  const keyframes = useMemo(
    () => `
@font-face {
  font-family: 'Baloo 2';
  font-style: normal;
  font-weight: 800;
  src: url('/fonts/baloo2-latin-800.woff2') format('woff2');
  font-display: swap;
}
@keyframes numberPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
@keyframes numberPop {
  0%   { transform: scale(1) rotate(0deg); }
  35%  { transform: scale(1.35) rotate(-8deg); }
  60%  { transform: scale(0.92) rotate(6deg); }
  80%  { transform: scale(1.12) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes numberShake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  20%      { transform: translateX(-8px) rotate(-6deg); }
  40%      { transform: translateX(8px) rotate(6deg); }
  60%      { transform: translateX(-6px) rotate(-4deg); }
  80%      { transform: translateX(6px) rotate(4deg); }
}
@keyframes numberDrop {
  0%   { transform: translateY(-120%) scale(0.6); opacity: 0; }
  60%  { transform: translateY(8%) scale(1.08); opacity: 1; }
  80%  { transform: translateY(-4%) scale(0.96); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
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
      <style>{keyframes}</style>

      {/* The number to look for, big and friendly. */}
      <Box
        data-pw="number-target"
        sx={{
          width: 220,
          height: 220,
          margin: '1.5rem auto',
          bgcolor: '#fff',
          backgroundImage:
            'radial-gradient(circle at 35% 30%, #ffffff 0%, #eaf4ff 70%, #d7e9ff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(77,150,255,0.35), inset 0 -6px 12px rgba(77,150,255,0.15)',
          border: '7px solid #4D96FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'numberPulse 1.6s ease-in-out infinite',
        }}
      >
        <Typography
          data-pw="number-target-value"
          variant="h1"
          sx={{
            fontFamily: FUN_FONT,
            fontWeight: 900,
            color: '#4D96FF',
            fontSize: 'clamp(6rem, 14vw, 9rem)',
            lineHeight: 1,
            textShadow: '0 3px 0 rgba(255,255,255,0.9), 0 6px 10px rgba(77,150,255,0.35)',
          }}
        >
          {target}
        </Typography>
      </Box>

      <Box sx={gridStyle}>
        {tiles.map((tile, i) => {
          const isWinner = found && tile.value === target;
          const isWrong = wrongIndex === i;
          return (
            <Box
              key={i}
              data-pw="number-tile"
              onClick={() => handleTap(i)}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: '1.5rem',
                bgcolor: tile.bg,
                backgroundImage: `linear-gradient(160deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)`,
                border: '4px solid rgba(255,255,255,0.85)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.06)' },
                '&:active': { transform: 'scale(0.9)' },
                animation: isWinner
                  ? 'numberPop 0.6s ease-in-out'
                  : isWrong
                    ? 'numberShake 0.45s ease-in-out'
                    : 'numberDrop 0.5s ease-in-out both',
                animationDelay: isWinner || isWrong ? '0s' : `${i * 0.05}s`,
              }}
            >
              <Typography
                data-pw="number-tile-value"
                sx={{
                  fontFamily: FUN_FONT,
                  fontWeight: 900,
                  color: '#333',
                  fontSize: 'clamp(3rem, 9vw, 5rem)',
                  lineHeight: 1,
                  textShadow: '0 2px 0 rgba(255,255,255,0.85), 0 4px 8px rgba(0,0,0,0.18)',
                }}
              >
                {tile.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
