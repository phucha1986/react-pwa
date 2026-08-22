import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { playNote } from './sound';

const KEYS = [
  { note: 'C', freq: 261.63, color: '#FF6B6B' },
  { note: 'D', freq: 293.66, color: '#FFA94D' },
  { note: 'E', freq: 329.63, color: '#FFD43B' },
  { note: 'F', freq: 349.23, color: '#69DB7C' },
  { note: 'G', freq: 392.0, color: '#4DABF7' },
  { note: 'A', freq: 440.0, color: '#9775FA' },
  { note: 'B', freq: 493.88, color: '#F783AC' },
  { note: 'C', freq: 523.25, color: '#38D9A9' },
];

// Desktop keyboard support (a s d f g h j k) for testing.
const KEYBOARD_MAP: Record<string, number> = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6, k: 7 };

// Songs the kid can pick from the carousel. Lanes map to KEYS (C D E F G A B C).
type Song = {
  id: string;
  photo: string;
  nameKey: 'songHappyBirthday' | 'songTwinkleTwinkle' | 'songMaryLamb' | 'songJingleBells';
  notes: number[];
};

const SONGS: Song[] = [
  {
    id: 'happy-birthday',
    photo: '🎂',
    nameKey: 'songHappyBirthday',
    notes: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3, 0, 0, 7, 5, 3, 2, 4, 4, 3, 1, 3, 2],
  },
  {
    id: 'twinkle-twinkle',
    photo: '⭐',
    nameKey: 'songTwinkleTwinkle',
    notes: [
      0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 0, 0, 4, 4, 5, 5, 4, 3, 3, 2,
      2, 1, 1, 0,
    ],
  },
  {
    id: 'mary-lamb',
    photo: '🐑',
    nameKey: 'songMaryLamb',
    notes: [4, 3, 2, 3, 4, 4, 4, 3, 3, 3, 4, 5, 5, 4, 3, 2, 1, 2, 3, 3],
  },
  {
    id: 'jingle-bells',
    photo: '🔔',
    nameKey: 'songJingleBells',
    notes: [0, 0, 0, 2, 2, 0, 0, 4, 4, 4, 3, 3, 2, 2, 1, 1, 0],
  },
];

const BAR_HEIGHT = 56;
const PIANO_RATIO = 0.42; // piano takes 42% of the play height
const ZONE_RATIO = 0.18; // hit zone height as a fraction of the play area
const BOTTOM_BAR_HEIGHT = 76; // keep the piano above the global bottom bar
const NOTE_INTERVAL = 500; // ms per note — shared by auto-play and bar spawning
const MAX_ACTIVE_BARS = 4;

type Bar = { id: number; lane: number; y: number };

let nextId = 1;

export default function PianoGame() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<'ready' | 'playing'>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('piano-best') || 0));
  const [isPortrait, setIsPortrait] = useState(() => window.innerHeight > window.innerWidth);
  const [pops, setPops] = useState<Record<number, number>>({});
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [, setTick] = useState(0);

  const barsRef = useRef<Bar[]>([]);
  const scoreRef = useRef(0);
  const phaseRef = useRef(phase);
  const lastSpawnRef = useRef(0);
  const lastLaneRef = useRef(-1);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const songNotesRef = useRef<number[] | null>(null);
  const songIndexRef = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const autoPlayIndexRef = useRef(0);

  phaseRef.current = phase;

  // Track orientation so the game can auto-rotate in portrait.
  useEffect(() => {
    const onResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setAutoPlaying(false);
  }, []);

  // Play the chosen song hands-free (loops until stopped) so kids can just listen.
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) return;
    const notes = songNotesRef.current ?? SONGS[0].notes;
    autoPlayIndexRef.current = 0;
    setAutoPlaying(true);
    const step = () => {
      const lane = notes[autoPlayIndexRef.current % notes.length];
      autoPlayIndexRef.current += 1;
      playNote(KEYS[lane].freq);
      setPops((p) => ({ ...p, [lane]: performance.now() }));
      autoPlayTimerRef.current = window.setTimeout(step, NOTE_INTERVAL);
    };
    step();
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) stopAutoPlay();
    else startAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Stop auto-play when the page unmounts.
  useEffect(
    () => () => {
      if (autoPlayTimerRef.current !== null) window.clearTimeout(autoPlayTimerRef.current);
    },
    [],
  );

  const start = useCallback(
    (song: Song) => {
      stopAutoPlay();
      barsRef.current = [];
      scoreRef.current = 0;
      setScore(0);
      songNotesRef.current = song.notes;
      songIndexRef.current = 0;
      lastSpawnRef.current = performance.now();
      lastTimeRef.current = performance.now();
      setPhase('playing');
    },
    [stopAutoPlay],
  );

  // Game loop: move bars, spawn new ones, drop missed ones.
  useEffect(() => {
    if (phase !== 'playing') return;
    const loop = (now: number) => {
      const dt = Math.min(50, now - lastTimeRef.current);
      lastTimeRef.current = now;
      const area = areaRef.current;
      if (area) {
        const h = area.clientHeight;
        // Speed up gently as the score grows.
        const fallTime = Math.max(1400, 2800 - scoreRef.current * 30);
        const speed = h / fallTime; // px per ms
        for (const bar of barsRef.current) bar.y += speed * dt;
        barsRef.current = barsRef.current.filter((b) => b.y < h + BAR_HEIGHT);

        const spawnEvery = NOTE_INTERVAL;
        if (now - lastSpawnRef.current > spawnEvery && barsRef.current.length < MAX_ACTIVE_BARS) {
          lastSpawnRef.current = now;
          const notes = songNotesRef.current;
          let lane: number;
          if (notes && notes.length > 0) {
            // Follow the chosen song's melody (loops when it ends).
            lane = notes[songIndexRef.current % notes.length];
            songIndexRef.current += 1;
          } else {
            lane = Math.floor(Math.random() * KEYS.length);
            if (lane === lastLaneRef.current) lane = (lane + 1) % KEYS.length;
          }
          lastLaneRef.current = lane;
          barsRef.current.push({ id: nextId++, lane, y: -BAR_HEIGHT });
        }
      }
      setTick((v) => v + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const pressKey = useCallback((lane: number) => {
    if (phaseRef.current !== 'playing') return;
    // Always play the note so kids can freestyle too.
    playNote(KEYS[lane].freq);
    const area = areaRef.current;
    if (!area) return;
    const h = area.clientHeight;
    const zoneTop = h - h * ZONE_RATIO;
    const zoneBottom = h + BAR_HEIGHT * 0.5;
    const idx = barsRef.current.findIndex(
      (b) => b.lane === lane && b.y + BAR_HEIGHT >= zoneTop && b.y <= zoneBottom,
    );
    if (idx >= 0) {
      barsRef.current.splice(idx, 1);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setBest((b) => {
        const nb = Math.max(b, scoreRef.current);
        localStorage.setItem('piano-best', String(nb));
        return nb;
      });
      setPops((p) => ({ ...p, [lane]: performance.now() }));
    }
  }, []);

  // Keyboard support for desktop testing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const lane = KEYBOARD_MAP[e.key.toLowerCase()];
      if (lane !== undefined) pressKey(lane);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressKey]);

  // Scroll the song carousel one item left/right.
  const scrollCarousel = (dir: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  // Which lanes currently have a bar inside the hit zone (key highlight color).
  const areaH = areaRef.current?.clientHeight ?? 0;
  const zoneTop = areaH - areaH * ZONE_RATIO;
  const zoneBottom = areaH + BAR_HEIGHT * 0.5;
  const activeLane = new Map<number, string>();
  for (const b of barsRef.current) {
    if (b.y + BAR_HEIGHT >= zoneTop && b.y <= zoneBottom)
      activeLane.set(b.lane, KEYS[b.lane].color);
  }
  const now = performance.now();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: BOTTOM_BAR_HEIGHT,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #74B9FF 0%, #A8D8FF 55%, #DFF3FF 100%)',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* In portrait, rotate the whole game 90° so it plays in landscape. */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...(isPortrait
            ? {
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `calc(100vh - ${BOTTOM_BAR_HEIGHT}px)`,
                height: '100vw',
                transform: 'translate(-50%, -50%) rotate(90deg)',
              }
            : {}),
        }}
      >
        {/* Score / best (only while playing) */}
        {phase === 'playing' && (
          <Stack direction="row" justifyContent="space-between" sx={{ px: 2, pt: 1.5, zIndex: 5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                borderRadius: '1rem',
                px: 2.5,
                py: 0.75,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#666' }}>
                {t.pianoScore}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#4C6EF5" lineHeight={1.1}>
                {score}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: '1rem',
                  px: 2.5,
                  py: 0.75,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#666' }}>
                  {t.pianoBest}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="#F59F00" lineHeight={1.1}>
                  {best}
                </Typography>
              </Box>
              <IconButton
                onClick={toggleAutoPlay}
                aria-label={t.pianoAutoPlay}
                title={t.pianoAutoPlay}
                sx={{
                  bgcolor: autoPlaying ? '#E8590C' : 'rgba(255,255,255,0.9)',
                  color: autoPlaying ? '#fff' : '#E8590C',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: autoPlaying ? '#D9480F' : '#fff' },
                }}
              >
                {autoPlaying ? (
                  <StopIcon sx={{ fontSize: 30 }} />
                ) : (
                  <PlayCircleOutlineIcon sx={{ fontSize: 34 }} />
                )}
              </IconButton>
            </Stack>
          </Stack>
        )}

        {/* Falling bars area */}
        <Box ref={areaRef} sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Soft hit-zone glow just above the piano */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${ZONE_RATIO * 100}%`,
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.45))',
              pointerEvents: 'none',
            }}
          />
          {barsRef.current.map((b) => (
            <Box
              key={b.id}
              sx={{
                position: 'absolute',
                top: b.y,
                left: `calc(4px + ${b.lane} * (100% - 4px) / ${KEYS.length})`,
                width: `calc((100% - 36px) / ${KEYS.length})`,
                height: BAR_HEIGHT,
                bgcolor: KEYS[b.lane].color,
                borderRadius: 14,
                boxShadow: `0 0 18px ${KEYS[b.lane].color}`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </Box>

        {/* Piano */}
        <Box
          sx={{
            height: `${PIANO_RATIO * 100}%`,
            display: 'flex',
            gap: 1,
            px: 1,
            pt: 0.5,
            pb: 1,
            bgcolor: 'rgba(255,255,255,0.3)',
            borderTop: '4px solid rgba(255,255,255,0.7)',
          }}
        >
          {KEYS.map((k, i) => {
            const active = activeLane.get(i);
            const popped = pops[i] !== undefined && now - pops[i] < 250;
            return (
              <Box
                key={i}
                onPointerDown={(e) => {
                  e.preventDefault();
                  pressKey(i);
                }}
                sx={{
                  flex: 1,
                  borderRadius: 0,
                  bgcolor: active ?? '#FFFFFF',
                  boxShadow: active
                    ? `0 0 26px ${active}, 0 4px 0 rgba(0,0,0,0.18)`
                    : '0 4px 0 rgba(0,0,0,0.18)',
                  transform: popped ? 'scale(1.07)' : 'scale(1)',
                  transition: 'transform 0.12s ease',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  pb: 1,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                <Typography
                  sx={{ fontSize: 18, fontWeight: 800, color: active ? '#fff' : '#B0B0B0' }}
                >
                  {k.note}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Start overlay */}
        {phase === 'ready' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              bgcolor: 'rgba(255,255,255,0.6)',
            }}
          >
            <Typography variant="h3" fontWeight={900} color="#4C6EF5">
              🎹 {t.pianoTitle}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#555' }}>
              {t.pianoChooseSong}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                onClick={() => scrollCarousel(-1)}
                sx={{ color: '#4C6EF5', fontSize: 40, fontWeight: 900 }}
              >
                ‹
              </IconButton>
              <Box
                ref={carouselRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  maxWidth: '65vw',
                  px: 1,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {SONGS.map((song) => (
                  <Box
                    key={song.id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      start(song);
                    }}
                    sx={{
                      scrollSnapAlign: 'center',
                      flexShrink: 0,
                      // Size cards so at least 4 fit in the 65vw carousel at once.
                      width: 'calc((65vw - 48px) / 4)',
                      height: 170,
                      bgcolor: '#fff',
                      borderRadius: 24,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    <Typography sx={{ fontSize: 64, lineHeight: 1 }}>{song.photo}</Typography>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#4C6EF5',
                        px: 1,
                        textAlign: 'center',
                      }}
                    >
                      {t[song.nameKey]}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <IconButton
                onClick={() => scrollCarousel(1)}
                sx={{ color: '#4C6EF5', fontSize: 40, fontWeight: 900 }}
              >
                ›
              </IconButton>
            </Stack>
            <Typography
              sx={{ fontSize: 14, color: '#777', textAlign: 'center', px: 3, maxWidth: 480 }}
            >
              {t.pianoHint}
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/')}
              sx={{ color: '#4C6EF5', fontWeight: 700 }}
            >
              Home
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
