import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import parrotIcon from '../AnimalGame/logos/parrot.png';
import { playFlapSound, playHitSound, playScoreSound } from './sound';

// Logical game size (canvas is scaled to fit the screen)
const W = 400;
const H = 600;
const GROUND_H = 80;
const BIRD_X = 100;
const BIRD_R = 16; // collision radius
const GRAVITY = 1500; // px/s^2
const FLAP_VY = -420; // px/s
const PIPE_W = 64;
const PIPE_GAP = 165;
const PIPE_SPACING = 220; // horizontal distance between pipes
const PIPE_SPEED = 150; // px/s

type Phase = 'ready' | 'playing' | 'dead';

interface Pipe {
  x: number;
  gapY: number; // center of the gap
  scored: boolean;
}

interface GameState {
  phase: Phase;
  birdY: number;
  birdVY: number;
  pipes: Pipe[];
  score: number;
  groundOffset: number;
  deadAt: number;
}

const BEST_KEY = 'flappy-best';

const readBest = (): number => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const randGapY = () => {
  const margin = 90;
  return margin + Math.random() * (H - GROUND_H - margin * 2);
};

const initialState = (): GameState => ({
  phase: 'ready',
  birdY: H / 2 - 40,
  birdVY: 0,
  pipes: [],
  score: 0,
  groundOffset: 0,
  deadAt: 0,
});

export default function FlappyBird() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initialState());
  const birdImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  // Load the bird sprite once
  useEffect(() => {
    const img = new Image();
    img.src = parrotIcon;
    img.onload = () => {
      birdImgRef.current = img;
    };
    return () => {
      img.onload = null;
    };
  }, []);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'dead') return;
    if (s.phase === 'ready') {
      s.phase = 'playing';
      s.pipes = [
        { x: W + 120, gapY: randGapY(), scored: false },
        { x: W + 120 + PIPE_SPACING, gapY: randGapY(), scored: false },
        { x: W + 120 + PIPE_SPACING * 2, gapY: randGapY(), scored: false },
      ];
      setPhase('playing');
    }
    s.birdVY = FLAP_VY;
    playFlapSound();
  }, []);

  const restart = useCallback(() => {
    stateRef.current = initialState();
    setPhase('ready');
    setScore(0);
  }, []);

  // Input: pointer + keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        const s = stateRef.current;
        if (s.phase === 'dead') {
          if (performance.now() - s.deadAt > 500) restart();
        } else {
          flap();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap, restart]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPipe = (p: Pipe) => {
      const gapTop = p.gapY - PIPE_GAP / 2;
      const gapBottom = p.gapY + PIPE_GAP / 2;
      const body = '#6BCB77';
      const rim = '#4CAF50';
      const rimH = 24;

      // Top pipe
      ctx.fillStyle = body;
      ctx.fillRect(p.x, 0, PIPE_W, gapTop - rimH);
      ctx.fillStyle = rim;
      ctx.fillRect(p.x - 4, gapTop - rimH, PIPE_W + 8, rimH);
      // Bottom pipe
      ctx.fillStyle = rim;
      ctx.fillRect(p.x - 4, gapBottom, PIPE_W + 8, rimH);
      ctx.fillStyle = body;
      ctx.fillRect(p.x, gapBottom + rimH, PIPE_W, H - GROUND_H - gapBottom - rimH);
    };

    const draw = (s: GameState) => {
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#8ED6F5');
      sky.addColorStop(1, '#DFF3FB');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Clouds (simple, parallax with ground)
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const cloudShift = (s.groundOffset * 0.3) % (W + 160);
      for (const [cx, cy, cr] of [
        [60, 110, 22],
        [220, 70, 28],
        [340, 150, 20],
      ] as const) {
        const x = ((((cx - cloudShift) % (W + 160)) + W + 160) % (W + 160)) - 80;
        ctx.beginPath();
        ctx.arc(x, cy, cr, 0, Math.PI * 2);
        ctx.arc(x + cr * 0.9, cy + 6, cr * 0.75, 0, Math.PI * 2);
        ctx.arc(x - cr * 0.9, cy + 6, cr * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pipes
      for (const p of s.pipes) drawPipe(p);

      // Ground
      ctx.fillStyle = '#E8D26B';
      ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
      ctx.fillStyle = '#C9B44C';
      const gShift = s.groundOffset % 40;
      for (let x = -40; x < W + 40; x += 40) {
        ctx.fillRect(x - gShift, H - GROUND_H, 20, 10);
      }
      ctx.fillStyle = '#8FBF4D';
      ctx.fillRect(0, H - GROUND_H, W, 6);

      // Bird
      const img = birdImgRef.current;
      const tilt = Math.max(-0.5, Math.min(1.1, s.birdVY / 500));
      ctx.save();
      ctx.translate(BIRD_X, s.birdY);
      ctx.rotate(tilt);
      if (img) {
        const size = BIRD_R * 2.4;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = '#FFADAD';
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const step = (ts: number) => {
      const s = stateRef.current;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.033);
      lastTsRef.current = ts;

      if (s.phase !== 'dead') {
        s.groundOffset += PIPE_SPEED * dt;
      }

      if (s.phase === 'playing') {
        s.birdVY += GRAVITY * dt;
        s.birdY += s.birdVY * dt;

        // Move pipes
        for (const p of s.pipes) {
          p.x -= PIPE_SPEED * dt;
          if (!p.scored && p.x + PIPE_W < BIRD_X - BIRD_R) {
            p.scored = true;
            s.score += 1;
            setScore(s.score);
            playScoreSound();
          }
        }
        // Recycle pipes
        if (s.pipes.length && s.pipes[0].x < -PIPE_W) {
          s.pipes.shift();
          const lastX = s.pipes[s.pipes.length - 1].x;
          s.pipes.push({ x: lastX + PIPE_SPACING, gapY: randGapY(), scored: false });
        }

        // Collisions
        const groundY = H - GROUND_H;
        let dead = s.birdY + BIRD_R >= groundY || s.birdY - BIRD_R <= 0;
        if (!dead) {
          for (const p of s.pipes) {
            if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
              const gapTop = p.gapY - PIPE_GAP / 2;
              const gapBottom = p.gapY + PIPE_GAP / 2;
              if (s.birdY - BIRD_R < gapTop || s.birdY + BIRD_R > gapBottom) {
                dead = true;
                break;
              }
            }
          }
        }

        if (dead) {
          s.phase = 'dead';
          s.deadAt = performance.now();
          s.birdY = Math.min(s.birdY, groundY - BIRD_R);
          setPhase('dead');
          playHitSound();
          setBest((prev) => {
            const next = Math.max(prev, s.score);
            try {
              localStorage.setItem(BEST_KEY, String(next));
            } catch {
              /* storage unavailable */
            }
            return next;
          });
        }
      } else if (s.phase === 'dead') {
        // Let the bird fall to the ground
        const groundY = H - GROUND_H;
        if (s.birdY + BIRD_R < groundY) {
          s.birdVY += GRAVITY * dt;
          s.birdY = Math.min(s.birdY + s.birdVY * dt, groundY - BIRD_R);
        }
      }

      draw(s);
      rafRef.current = requestAnimationFrame(step);
    };

    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerDown = () => {
    const s = stateRef.current;
    if (s.phase === 'dead') {
      if (performance.now() - s.deadAt > 500) restart();
    } else {
      flap();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#FFFCEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        onPointerDown={onPointerDown}
        sx={{
          position: 'relative',
          width: `min(100vw, calc(100vh / ${H / W}))`,
          aspectRatio: `${W} / ${H}`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'manipulation',
        }}
      >
        <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', height: '100%' }} />

        {/* HUD */}
        {phase === 'playing' && (
          <Box sx={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              }}
            >
              {score}
            </Typography>
          </Box>
        )}

        {phase === 'ready' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
            >
              {t.flappyTitle}
            </Typography>
            <Typography sx={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              {t.flappyTapToStart}
            </Typography>
          </Box>
        )}

        {phase === 'dead' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: 'rgba(0,0,0,0.35)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF6B6B' }}>
              {t.flappyGameOver}
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box textAlign="center">
                <Typography sx={{ color: '#fff', opacity: 0.85 }}>{t.flappyScore}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                  {score}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography sx={{ color: '#fff', opacity: 0.85 }}>{t.flappyBest}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD93D' }}>
                  {best}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              sx={{
                bgcolor: '#6BCB77',
                fontWeight: 800,
                px: 3,
                borderRadius: '1rem',
              }}
            >
              {t.flappyPlayAgain}
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/');
              }}
              onPointerDown={(e) => e.stopPropagation()}
              sx={{ color: '#fff' }}
            >
              Home
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
