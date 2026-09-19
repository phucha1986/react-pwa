import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { getAudioContext, playNote, playPad, playPianoNote } from './sound';

const KEYS = [
  // First octave (C to B)
  { note: 'C1', freq: 16.35, color: '#FFFFFF' },
  { note: 'C#1', freq: 17.32, color: '#222222' },
  { note: 'D1', freq: 18.35, color: '#FFFFFF' },
  { note: 'D#1', freq: 19.45, color: '#222222' },
  { note: 'E1', freq: 20.6, color: '#FFFFFF' },
  { note: 'F1', freq: 21.83, color: '#FFFFFF' },
  { note: 'F#1', freq: 23.12, color: '#222222' },
  { note: 'G1', freq: 24.5, color: '#FFFFFF' },
  { note: 'G#1', freq: 25.96, color: '#222222' },
  { note: 'A1', freq: 27.5, color: '#FFFFFF' },
  { note: 'A#1', freq: 29.14, color: '#222222' },
  { note: 'B1', freq: 30.87, color: '#FFFFFF' },

  // Second octave (C to B)
  { note: 'C2', freq: 32.7, color: '#FFFFFF' },
  { note: 'C#2', freq: 34.65, color: '#222222' },
  { note: 'D2', freq: 36.71, color: '#FFFFFF' },
  { note: 'D#2', freq: 38.89, color: '#222222' },
  { note: 'E2', freq: 41.2, color: '#FFFFFF' },
  { note: 'F2', freq: 43.65, color: '#FFFFFF' },
  { note: 'F#2', freq: 46.25, color: '#222222' },
  { note: 'G2', freq: 49.0, color: '#FFFFFF' },
  { note: 'G#2', freq: 51.91, color: '#222222' },
  { note: 'A2', freq: 55.0, color: '#FFFFFF' },
  { note: 'A#2', freq: 58.27, color: '#222222' },
  { note: 'B2', freq: 61.74, color: '#FFFFFF' },

  // Third octave (C to B)
  { note: 'C3', freq: 65.41, color: '#FFFFFF' },
  { note: 'C#3', freq: 69.3, color: '#222222' },
  { note: 'D3', freq: 73.42, color: '#FFFFFF' },
  { note: 'D#3', freq: 77.78, color: '#222222' },
  { note: 'E3', freq: 82.41, color: '#FFFFFF' },
  { note: 'F3', freq: 87.31, color: '#FFFFFF' },
  { note: 'F#3', freq: 92.5, color: '#222222' },
  { note: 'G3', freq: 98.0, color: '#FFFFFF' },
  { note: 'G#3', freq: 103.83, color: '#222222' },
  { note: 'A3', freq: 110.0, color: '#FFFFFF' },
  { note: 'A#3', freq: 116.54, color: '#222222' },
  { note: 'B3', freq: 123.47, color: '#FFFFFF' },

  // Fourth octave (C to B)
  { note: 'C4', freq: 130.81, color: '#FFFFFF' },
  { note: 'C#4', freq: 138.59, color: '#222222' },
  { note: 'D4', freq: 146.83, color: '#FFFFFF' },
  { note: 'D#4', freq: 155.56, color: '#222222' },
  { note: 'E4', freq: 164.81, color: '#FFFFFF' },
  { note: 'F4', freq: 174.61, color: '#FFFFFF' },
  { note: 'F#4', freq: 185.0, color: '#222222' },
  { note: 'G4', freq: 196.0, color: '#FFFFFF' },
  { note: 'G#4', freq: 207.65, color: '#222222' },
  { note: 'A4', freq: 220.0, color: '#FFFFFF' },
  { note: 'A#4', freq: 233.08, color: '#222222' },
  { note: 'B4', freq: 246.94, color: '#FFFFFF' },

  // Fifth octave (C to B)
  { note: 'C5', freq: 261.63, color: '#FFFFFF' },
  { note: 'C#5', freq: 277.18, color: '#222222' },
  { note: 'D5', freq: 293.66, color: '#FFFFFF' },
  { note: 'D#5', freq: 311.13, color: '#222222' },
  { note: 'E5', freq: 329.63, color: '#FFFFFF' },
  { note: 'F5', freq: 349.23, color: '#FFFFFF' },
  { note: 'F#5', freq: 369.99, color: '#222222' },
  { note: 'G5', freq: 392.0, color: '#FFFFFF' },
  { note: 'G#5', freq: 415.3, color: '#222222' },
  { note: 'A5', freq: 440.0, color: '#FFFFFF' },
  { note: 'A#5', freq: 466.16, color: '#222222' },
  { note: 'B5', freq: 493.88, color: '#FFFFFF' },

  // Sixth octave (C to B) - Adding one more octave for a real piano feel
  { note: 'C6', freq: 523.25, color: '#FFFFFF' },
  { note: 'C#6', freq: 554.37, color: '#222222' },
  { note: 'D6', freq: 587.33, color: '#FFFFFF' },
  { note: 'D#6', freq: 622.25, color: '#222222' },
  { note: 'E6', freq: 659.25, color: '#FFFFFF' },
  { note: 'F6', freq: 698.46, color: '#FFFFFF' },
  { note: 'F#6', freq: 739.99, color: '#222222' },
  { note: 'G6', freq: 783.99, color: '#FFFFFF' },
  { note: 'G#6', freq: 830.61, color: '#222222' },
  { note: 'A6', freq: 880.0, color: '#FFFFFF' },
  { note: 'A#6', freq: 932.33, color: '#222222' },
  { note: 'B6', freq: 987.77, color: '#FFFFFF' },
];

// Desktop keyboard support (a s d f g h j k) for testing.
const KEYBOARD_MAP: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  j: 11,
  k: 12,
  l: 13,
  '[': 16,
  ']': 17,
  '\\': 18,
  z: 19,
  x: 20,
  c: 21,
  v: 22,
  b: 23,
  n: 24,
  m: 25,
  ',': 26,
  '.': 27,
  '/': 28,
  ';': 29,
  "'": 30,
  q: 31,
  r: 32,
  i: 33,
  o: 34,
  u: 35,
  p: 36,
  '0': 37,
  '1': 38,
  '2': 39,
  '3': 40,
  '4': 41,
  '5': 42,
  '6': 43,
  '7': 44,
  '8': 45,
  '9': 46,
};

// Songs the kid can pick from the carousel. Lanes map to KEYS (C D E F G A B C).
// Each melody step carries a duration in 1/16-note units, giving the music
// real rhythm (dotted eighths, half notes, whole notes) instead of a flat
// metronome. `lane: -1` is a rest (a breath between phrases).
type Step = { lane: number; len: number };
type Song = {
  id: string;
  photo: string;
  nameKey: 'songHappyBirthday' | 'songTwinkleTwinkle' | 'songMaryLamb' | 'songJingleBells';
  tempo: number; // beats per minute
  key: 'C' | 'G' | 'F'; // root for the harmony accompaniment
  steps: Step[];
};

const s = (lane: number, len = 4): Step => ({ lane, len });

const SONGS: Song[] = [
  {
    id: 'happy-birthday',
    photo: '🎂',
    nameKey: 'songHappyBirthday',
    tempo: 100,
    key: 'F',
    steps: [
      s(0, 3),
      s(0, 1),
      s(1),
      s(0),
      s(3),
      s(2, 6),
      s(0, 3),
      s(0, 1),
      s(1),
      s(0),
      s(4),
      s(3, 6),
      s(0, 3),
      s(0, 1),
      s(7),
      s(5),
      s(3),
      s(2),
      s(4, 3),
      s(4, 1),
      s(3),
      s(1),
      s(3),
      s(2, 8),
    ],
  },
  {
    id: 'twinkle-twinkle',
    photo: '⭐',
    nameKey: 'songTwinkleTwinkle',
    tempo: 112,
    key: 'C',
    steps: [
      s(0, 8),
      s(0, 8),
      s(4, 8),
      s(4, 8),
      s(5, 8),
      s(5, 8),
      s(4, 16),
      s(3, 8),
      s(3, 8),
      s(2, 8),
      s(2, 8),
      s(1, 8),
      s(1, 8),
      s(0, 16),
      s(4, 8),
      s(4, 8),
      s(3, 8),
      s(3, 8),
      s(2, 8),
      s(2, 8),
      s(1, 16),
      s(1, 8),
      s(1, 8),
      s(0, 16),
    ],
  },
  {
    id: 'mary-lamb',
    photo: '🐑',
    nameKey: 'songMaryLamb',
    tempo: 104,
    key: 'G',
    steps: [
      s(4),
      s(3),
      s(2),
      s(3),
      s(4),
      s(4),
      s(4, 8),
      s(3),
      s(3),
      s(3, 8),
      s(4),
      s(5),
      s(5, 8),
      s(4),
      s(3),
      s(2),
      s(3),
      s(4),
      s(4, 4),
      s(4, 4),
      s(3),
      s(3, 8),
      s(2, 8),
    ],
  },
  {
    id: 'jingle-bells',
    photo: '🔔',
    nameKey: 'songJingleBells',
    tempo: 120,
    key: 'C',
    steps: [
      s(0),
      s(0),
      s(0, 8),
      s(2),
      s(2),
      s(0, 8),
      s(4),
      s(4),
      s(4, 8),
      s(3),
      s(3),
      s(3, 12),
      s(2, 4),
      s(2, 4),
      s(2, 4),
      s(1),
      s(1, 4),
      s(2),
      s(4),
      s(3),
      s(2),
      s(0, 8),
      s(0, 8),
    ],
  },
];

// Diatonic triad chords (as lanes) for the auto-play accompaniment, in each
// song's key. Only the I chord is used for now (a steady, safe foundation).
const CHORDS: Record<'C' | 'G' | 'F', Record<string, number[]>> = {
  C: { I: [0, 4, 7], IV: [3, 6, 7], V: [5, 7, 0], vi: [5, 0, 3] },
  G: { I: [4, 7, 0], IV: [7, 0, 3], V: [5, 7, 4], vi: [0, 3, 5] },
  F: { I: [3, 6, 0], IV: [6, 0, 3], V: [0, 3, 6], vi: [5, 0, 4] },
};

const BAR_HEIGHT = 56;
const PIANO_RATIO = 0.35; // piano takes 35% of the play height for more keys
const ZONE_RATIO = 0.18; // hit zone height as a fraction of the play area
const BOTTOM_BAR_HEIGHT = 76; // keep the piano above the global bottom bar
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
  const songRef = useRef<Song | null>(null);
  const songIndexRef = useRef(0);
  const padRef = useRef<{ gains: GainNode[]; oscs: AudioScheduledSourceNode[] } | null>(null);
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

  // Fades out (and eventually disconnects) the current pad chord.
  const stopPad = useCallback(() => {
    const pad = padRef.current;
    if (!pad) return;
    padRef.current = null;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const g of pad.gains) g.gain.setTargetAtTime(0.0001, now, 0.12);
    window.setTimeout(() => pad.oscs.forEach((n) => n.disconnect()), 700);
  }, []);

  // Plays a soft, sustained chord (an octave low) through the shared
  // master/reverb bus. Used as the auto-play accompaniment so the song
  // sounds fuller than melody-only.
  const playPadChord = useCallback((lanes: number[], dur = 1.8) => {
    const freqs = lanes.map((l) => KEYS[l].freq / 2);
    padRef.current = playPad(freqs, dur, 0, 0.6);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setAutoPlaying(false);
    stopPad();
  }, [stopPad]);

  // Play the chosen song hands-free (loops until stopped) so kids can just
  // listen. Steps are walked with their real durations (in 1/16-note units),
  // so the melody has proper rhythm instead of a flat metronome.
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) return;
    const song = songRef.current ?? SONGS[0];
    autoPlayIndexRef.current = 0;
    setAutoPlaying(true);

    // Soft pad chord underneath the melody.
    playPadChord(CHORDS[song.key].I);

    const step = () => {
      const idx = autoPlayIndexRef.current % song.steps.length;
      const cur = song.steps[idx];
      const ms = (song.tempo / 60 / 4) * cur.len * 1000; // 16th-note ms
      if (cur.lane >= 0) {
        playNote(KEYS[cur.lane].freq, 0, 0.85);
        setPops((p) => ({ ...p, [cur.lane]: performance.now() }));
      }
      autoPlayIndexRef.current += 1;
      autoPlayTimerRef.current = window.setTimeout(step, ms);
    };
    step();
  }, [playPadChord]);

  const toggleAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) stopAutoPlay();
    else startAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Stop auto-play (and its pad) when the page unmounts.
  useEffect(
    () => () => {
      if (autoPlayTimerRef.current !== null) window.clearTimeout(autoPlayTimerRef.current);
      stopPad();
    },
    [stopPad],
  );

  const start = useCallback(
    (song: Song) => {
      stopAutoPlay();
      barsRef.current = [];
      scoreRef.current = 0;
      setScore(0);
      songRef.current = song;
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

        // Spawn the next melody step as a bar. Each step carries its own
        // duration (in 1/16-note units), so the falling bars follow the song's
        // real rhythm. A rest (lane -1) just waits without spawning.
        const song = songRef.current;
        const spawnEvery = song
          ? (song.tempo / 60 / 4) * song.steps[songIndexRef.current % song.steps.length].len * 1000
          : 500;
        if (now - lastSpawnRef.current > spawnEvery && barsRef.current.length < MAX_ACTIVE_BARS) {
          lastSpawnRef.current = now;
          let lane: number;
          if (song) {
            lane = song.steps[songIndexRef.current % song.steps.length].lane;
            songIndexRef.current += 1;
          } else {
            lane = Math.floor(Math.random() * KEYS.length);
            if (lane === lastLaneRef.current) lane = (lane + 1) % KEYS.length;
          }
          if (lane >= 0) {
            lastLaneRef.current = lane;
            barsRef.current.push({ id: nextId++, lane, y: -BAR_HEIGHT });
          }
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
    playPianoNote(KEYS[lane].freq);
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
            gap: 0,
            px: 1,
            pt: 0.5,
            pb: 1,
            bgcolor: 'rgba(255,255,255,0.3)',
            borderTop: '4px solid rgba(255,255,255,0.7)',
            position: 'relative',
          }}
        >
          {KEYS.map((k, i) => {
            const active = activeLane.get(i);
            const popped = pops[i] !== undefined && now - pops[i] < 250;
            // Determine if this is a black key (has # in note name)
            const isBlackKey = k.note.includes('#');

            return (
              <Box
                key={i}
                onPointerDown={(e) => {
                  e.preventDefault();
                  pressKey(i);
                }}
                sx={{
                  position: 'relative',
                  flex: 1,
                  borderRadius: 0,
                  bgcolor: isBlackKey ? k.color : '#FFFFFF',
                  boxShadow:
                    active && !isBlackKey
                      ? `0 0 26px ${active}, 0 4px 0 rgba(0,0,0,0.18)`
                      : isBlackKey
                        ? '0 4px 0 rgba(0,0,0,0.3)'
                        : '0 4px 0 rgba(0,0,0,0.18)',
                  transform: popped && !isBlackKey ? 'scale(1.07)' : 'scale(1)',
                  transition: 'transform 0.12s ease',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  pb: 1,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  zIndex: isBlackKey ? 1 : 0, // Black keys should be above white keys
                  ...(isBlackKey
                    ? {
                        height: '60%',
                        width: '70%',
                        marginLeft: '-15%',
                        marginRight: '-15%',
                        top: '20%',
                      }
                    : {}),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isBlackKey ? '#fff' : active ? '#fff' : '#B0B0B0',
                    textShadow: isBlackKey ? '0 0 4px rgba(0,0,0,0.5)' : 'none',
                  }}
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
