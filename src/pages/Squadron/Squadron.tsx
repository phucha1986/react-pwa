import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { drawScene } from '@/features/squadron/draw';
import { SquadronEngine, H, W } from '@/features/squadron/engine';
import {
  playBombSound,
  playBonusSound,
  playEnemyShotSound,
  playExplosionSound,
  playGameOverSound,
  playPowerupSound,
  playShotSound,
} from '@/features/squadron/sound';
import type { Input } from '@/features/squadron/types';
import { useLanguage } from '@/i18n/useLanguage';

const BEST_KEY = 'squadron-best';

const readBest = (): number => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const emptyInput = (): Input => ({
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  target: null,
});

export default function Squadron() {
  const { t } = useLanguage();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<Input>(emptyInput());
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const cloudRef = useRef<number>(0);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'dead'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bombs, setBombs] = useState(3);
  const [wave, setWave] = useState(0);
  const [best, setBest] = useState(readBest);

  const engineRef = useRef<SquadronEngine | null>(null);

  const commit = useCallback((engine: SquadronEngine) => {
    const s = engine.state;
    setScore(s.score);
    setLives(s.lives);
    setBombs(s.bombs);
    setWave(s.wave);
    setPhase(s.phase);
  }, []);

  // Engine + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new SquadronEngine((event) => {
      switch (event.type) {
        case 'shot':
          playShotSound();
          break;
        case 'enemyShot':
          playEnemyShotSound();
          break;
        case 'explosion':
          playExplosionSound(event.kind);
          break;
        case 'perfect':
          playBonusSound();
          break;
        case 'powerup':
          playPowerupSound();
          break;
        case 'bomb':
          playBombSound();
          break;
        case 'gameover':
          playGameOverSound();
          setBest((prev) => {
            const next = Math.max(prev, event.score);
            try {
              localStorage.setItem(BEST_KEY, String(next));
            } catch {
              /* storage unavailable */
            }
            return next;
          });
          break;
      }
      commit(engine);
    });
    engineRef.current = engine;

    const step = (ts: number) => {
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.033);
      lastTsRef.current = ts;

      engine.setInput(inputRef.current);
      engine.step(dt);
      if (engine.state.phase === 'playing') {
        cloudRef.current += 40 * dt;
      }
      drawScene(ctx, engine.state, cloudRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
    drawScene(ctx, engine.state, 0);

    return () => cancelAnimationFrame(rafRef.current);
  }, [commit]);

  const start = useCallback(
    (input?: Input) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.start(performance.now());
      inputRef.current = input ?? { ...emptyInput(), fire: true };
      commit(engine);
    },
    [commit],
  );

  const bomb = useCallback(() => {
    const engine = engineRef.current;
    if (engine && engine.state.phase === 'playing') {
      engine.useBomb();
      commit(engine);
    }
  }, [commit]);

  // Keyboard input
  useEffect(() => {
    const held = new Set<string>();

    const apply = () => {
      inputRef.current = {
        up: held.has('ArrowUp') || held.has('KeyW'),
        down: held.has('ArrowDown') || held.has('KeyS'),
        left: held.has('ArrowLeft') || held.has('KeyA'),
        right: held.has('ArrowRight') || held.has('KeyD'),
        fire: held.has('Space'),
        target: null,
      };
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const code = e.code;
      if (
        code === 'Space' ||
        code.startsWith('Arrow') ||
        ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)
      ) {
        e.preventDefault();
      }

      const engine = engineRef.current;
      if (!engine) return;

      if (code === 'Space') {
        if (engine.state.phase === 'dead') {
          if (performance.now() - engine.state.deadAt > 500) start();
          return;
        }
        if (engine.state.phase === 'ready') {
          start();
        }
      }

      if (code === 'KeyB') {
        bomb();
        return;
      }

      held.add(code);
      apply();
    };

    const onUp = (e: KeyboardEvent) => {
      held.delete(e.code);
      apply();
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [bomb, start]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;

    const engine = engineRef.current;
    if (!engine) return;
    const pointerInput = { ...emptyInput(), fire: true, target: { x, y } };

    if (engine.state.phase !== 'playing') {
      start(pointerInput);
      return;
    }

    inputRef.current = pointerInput;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    inputRef.current = { ...emptyInput(), fire: true, target: { x, y } };
  };

  const onPointerUp = () => {
    inputRef.current = emptyInput();
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
        sx={{
          position: 'relative',
          width: `min(100vw, calc(100vh * ${W / H}))`,
          aspectRatio: `${W} / ${H}`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          data-pw="squadron-canvas"
          style={{ width: '100%', height: '100%', display: 'block' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {/* HUD */}
        <Box
          data-pw="squadron-hud"
          sx={{
            position: 'absolute',
            top: 10,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="baseline">
            <Typography variant="h6" data-pw="squadron-score" sx={{ fontWeight: 800 }}>
              {score}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t.squadronBest}: {best}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="baseline">
            <Typography variant="body2" data-pw="squadron-wave" sx={{ opacity: 0.8 }}>
              {t.squadronWave} {wave}
            </Typography>
            <Typography variant="body2" data-pw="squadron-lives">
              {'❤'.repeat(Math.max(0, lives))}
            </Typography>
            <Typography variant="body2" data-pw="squadron-bombs">
              {'✦'.repeat(Math.max(0, bombs))}
            </Typography>
          </Stack>
        </Box>

        {phase === 'ready' && (
          <Box
            data-pw="squadron-ready"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              bgcolor: 'rgba(20,26,46,0.55)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
              {t.squadronTitle}
            </Typography>
            <Typography sx={{ color: '#fff', opacity: 0.85, textAlign: 'center', px: 3 }}>
              {t.squadronHint}
            </Typography>
            <Button
              data-pw="squadron-start"
              variant="contained"
              sx={{ mt: 1, bgcolor: '#6BCB77' }}
              onClick={() => start()}
            >
              {t.squadronPlay}
            </Button>
          </Box>
        )}

        {phase === 'dead' && (
          <Box
            data-pw="squadron-gameover"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: 'rgba(0,0,0,0.45)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF6B6B' }}>
              {t.squadronGameOver}
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box textAlign="center">
                <Typography sx={{ color: '#fff', opacity: 0.85 }}>{t.squadronScore}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                  {score}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography sx={{ color: '#fff', opacity: 0.85 }}>{t.squadronBest}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD93D' }}>
                  {best}
                </Typography>
              </Box>
            </Stack>
            <Button
              data-pw="squadron-play-again"
              variant="contained"
              sx={{ bgcolor: '#6BCB77' }}
              onClick={() => start()}
            >
              {t.squadronPlayAgain}
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="caption" sx={{ mt: 1.5, color: '#666' }}>
        WASD / arrows to fly · Space to shoot · B for a bomb
      </Typography>
    </Box>
  );
}
