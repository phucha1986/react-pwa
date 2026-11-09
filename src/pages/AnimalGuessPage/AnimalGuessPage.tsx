import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import CheckIcon from '@mui/icons-material/Check';
import { Container, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import antIcon from '../AnimalGame/logos/ant.png';
import catIcon from '../AnimalGame/logos/cat.png';
import cowIcon from '../AnimalGame/logos/cow.png';
import crocodileIcon from '../AnimalGame/logos/crocodile.png';
import dogIcon from '../AnimalGame/logos/dog.png';
import eagleIcon from '../AnimalGame/logos/eagle.png';
import elephantIcon from '../AnimalGame/logos/elephant.png';
import flamingoIcon from '../AnimalGame/logos/flamingo.png';
import frogIcon from '../AnimalGame/logos/frog.png';
import giraffeIcon from '../AnimalGame/logos/giraffe.png';
import goatIcon from '../AnimalGame/logos/goat.png';
import horseIcon from '../AnimalGame/logos/horse.png';
import hummingbirdIcon from '../AnimalGame/logos/hummingbird.png';
import leopardIcon from '../AnimalGame/logos/leopard.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import monkeyIcon from '../AnimalGame/logos/monkey.png';
import octopusIcon from '../AnimalGame/logos/octopus.png';
import orangutanIcon from '../AnimalGame/logos/orangutan.png';
import ostrichIcon from '../AnimalGame/logos/ostrich.png';
import parrotIcon from '../AnimalGame/logos/parrot.png';
import penguinIcon from '../AnimalGame/logos/penguin.png';
import rabbitIcon from '../AnimalGame/logos/rabbit.png';
import reindeerIcon from '../AnimalGame/logos/reindeer.png';
import sealIcon from '../AnimalGame/logos/seal.png';
import squirrelIcon from '../AnimalGame/logos/squirrel.png';
import tigerIcon from '../AnimalGame/logos/tiger.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';
import whaleIcon from '../AnimalGame/logos/whale.png';
import yakIcon from '../AnimalGame/logos/yak.png';
import zebraIcon from '../AnimalGame/logos/zebra.png';
import { playSuccessSound, playWrongSound, speak } from './sound';
import { AnimalPhoto, CheckBadge, ConfettiPiece, QuestionImage, Stage, StageGrid } from './styled';

// Animal data map
const animalData: Record<string, { word: string; icon: string }> = {
  lion: { word: 'Lion', icon: lionIcon },
  elephant: { word: 'Elephant', icon: elephantIcon },
  monkey: { word: 'Monkey', icon: monkeyIcon },
  giraffe: { word: 'Giraffe', icon: giraffeIcon },
  parrot: { word: 'Parrot', icon: parrotIcon },
  turtle: { word: 'Turtle', icon: turtleIcon },
  dog: { word: 'Dog', icon: dogIcon },
  cat: { word: 'Cat', icon: catIcon },
  cow: { word: 'Cow', icon: cowIcon },
  horse: { word: 'Horse', icon: horseIcon },
  goat: { word: 'Goat', icon: goatIcon },
  whale: { word: 'Whale', icon: whaleIcon },
  tiger: { word: 'Tiger', icon: tigerIcon },
  rabbit: { word: 'Rabbit', icon: rabbitIcon },
  octopus: { word: 'Octopus', icon: octopusIcon },
  zebra: { word: 'Zebra', icon: zebraIcon },
  eagle: { word: 'Eagle', icon: eagleIcon },
  crocodile: { word: 'Crocodile', icon: crocodileIcon },
  penguin: { word: 'Penguin', icon: penguinIcon },
  ostrich: { word: 'Ostrich', icon: ostrichIcon },
  seal: { word: 'Seal', icon: sealIcon },
  flamingo: { word: 'Flamingo', icon: flamingoIcon },
  leopard: { word: 'Leopard', icon: leopardIcon },
  ant: { word: 'Ant', icon: antIcon },
  squirrel: { word: 'Squirrel', icon: squirrelIcon },
  frog: { word: 'Frog', icon: frogIcon },
  hummingbird: { word: 'Hummingbird', icon: hummingbirdIcon },
  orangutan: { word: 'Orangutan', icon: orangutanIcon },
  yak: { word: 'Yak', icon: yakIcon },
  reindeer: { word: 'Reindeer', icon: reindeerIcon },
};

const CONFETTI_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#FFADAD', '#A0E7E5'];

// Vivid tile palette, same colors as the Number game — every tile gets a
// bright rounded square so the board reads as colorful, not washed-out pastel.
const TILE_PALETTE = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#B197FC',
  '#FFA94D',
  '#A0E7E5',
  '#FFC2D4',
];

// Each animal's own dominant color (in palette terms) — its tile avoids it
// (e.g. the blue whale never gets a blue tile, the pink flamingo never pink).
const ANIMAL_AVOID_COLORS: Record<string, string> = {
  lion: '#FFD93D', // gold
  monkey: '#FFA94D', // brown
  giraffe: '#FFD93D', // yellow
  parrot: '#6BCB77', // green
  turtle: '#6BCB77', // green
  dog: '#FFA94D', // brown
  horse: '#FFA94D', // brown
  whale: '#4D96FF', // blue
  tiger: '#FFA94D', // orange
  octopus: '#FF6B6B', // red
  eagle: '#FFA94D', // brown
  crocodile: '#6BCB77', // green
  flamingo: '#FFC2D4', // pink
  leopard: '#FFD93D', // gold
  squirrel: '#FFA94D', // orange
  frog: '#6BCB77', // green
  hummingbird: '#6BCB77', // green
  orangutan: '#FFA94D', // orange
  yak: '#FFA94D', // brown
  reindeer: '#FFA94D', // brown
};

type Confetti = {
  id: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

// Gentle difficulty ladder, mirroring the Number game: the grid grows as the
// kid scores, starting tiny (2x2) so a 4-year-old can succeed and capping at
// 3x3 so the board stays easy to scan for little ones.
const LEVELS = [
  { cols: 2, rows: 2 },
  { cols: 3, rows: 2 },
  { cols: 3, rows: 3 },
];
const LEVEL_UP_EVERY = 5;

function levelForScore(score: number): number {
  return Math.min(Math.floor(score / LEVEL_UP_EVERY), LEVELS.length - 1);
}

// How many copies of the target hide on a board: on the small 4-tile board
// there is exactly one target, so the kid finds a single animal; bigger
// boards hide more copies (6 tiles -> 2, 9 tiles -> 3).
function matchCountFor(count: number): number {
  return count <= 4 ? 1 : Math.max(2, Math.min(3, Math.floor(count / 3)));
}

// Are two grid slots neighbours — side by side in the same row, or stacked in
// the same column?
function areAdjacent(a: number, b: number, cols: number): boolean {
  const ra = Math.floor(a / cols);
  const rb = Math.floor(b / cols);
  const ca = a % cols;
  const cb = b % cols;
  return (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
}

// Pick slots for the target copies so no two copies sit next to each other —
// the kid should never see the same animal twice side by side. Falls back to
// the diagonal, which always satisfies the constraint on our boards.
function pickSpreadSlots(boardSize: number, cols: number, matches: number): number[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const shuffled = [...Array(boardSize).keys()].sort(() => Math.random() - 0.5);
    const chosen: number[] = [];
    for (const slot of shuffled) {
      if (chosen.some((c) => areAdjacent(c, slot, cols))) continue;
      chosen.push(slot);
      if (chosen.length === matches) return chosen;
    }
  }
  return Array.from({ length: matches }, (_, i) => i * (cols + 1));
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AnimalGuessPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const animalKey = query.get('animal')?.toLowerCase() || 'lion';

  const animal = useMemo(
    () => ({
      word: t.animals[animalKey] ?? animalData[animalKey]?.word ?? animalKey,
      icon: animalData[animalKey]?.icon,
    }),
    [animalKey, t],
  );

  const [foundSlots, setFoundSlots] = useState<Set<number>>(() => new Set());
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  // Tracks which animal was actually answered, so the success effect never
  // re-fires for the *next* animal after navigation (which would announce
  // "Great job" a second time and advance again).
  const answeredKeyRef = useRef<string | null>(null);

  // Mirrors the Number game: every correct pick raises the score, and the
  // board grows a step every LEVEL_UP_EVERY finds. The component stays
  // mounted as the animal query param changes, so the score carries over.
  // The level is frozen for the whole round (like NumberGame's buildRound) so
  // crossing a boundary mid-round never rebuilds the board under the kid.
  const [score, setScore] = useState(0);
  const [prevKey, setPrevKey] = useState(animalKey);
  const [roundLevel, setRoundLevel] = useState(() => levelForScore(score));
  if (prevKey !== animalKey) {
    setPrevKey(animalKey);
    setRoundLevel(levelForScore(score));
  }
  const { cols, rows } = LEVELS[roundLevel];
  const boardSize = cols * rows;
  const matches = matchCountFor(boardSize);

  const roundDone = foundSlots.size >= matches;

  // Reset state when the animal changes and announce the question
  useEffect(() => {
    setFoundSlots(new Set());
    setWrongPick(null);
    setConfetti([]);
    answeredKeyRef.current = null;
    speak(
      matches === 1
        ? t.questionOne(animal?.word ?? '')
        : t.questionMany(animal?.word ?? '', matches),
      undefined,
      lang,
    );
  }, [animalKey, animal?.word, t, lang, matches]);

  // Announce the correct answer, then advance to the next animal once the
  // speech finishes (so the "Great job" line is never cut off).
  useEffect(() => {
    if (!roundDone || answeredKeyRef.current !== animalKey) return;
    const keys = Object.keys(animalData);
    const currentIndex = keys.indexOf(animalKey);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    let done = false;
    const advance = () => {
      if (done) return;
      done = true;
      navigate(`/AnimalGuessPage?animal=${nextKey}`);
    };
    speak(t.greatJob(animal?.word ?? ''), advance, lang);
    // Safety net in case the speech engine never fires onend.
    const fallback = window.setTimeout(advance, 6000);
    return () => window.clearTimeout(fallback);
  }, [roundDone, animalKey, animal?.word, t, lang, navigate]);

  // `matches` copies of the target animal plus distractors filling the rest of
  // the level's grid, shuffled into the board. Slots (not animals) carry the
  // colors, so each tile is unique even though the target appears more than once.
  const options = useMemo(() => {
    const keys = Object.keys(animalData);
    const others = keys.filter((k) => k !== animalKey);
    const shuffledOthers = [...others]
      .sort(() => Math.random() - 0.5)
      .slice(0, boardSize - matches);
    // Spread the target copies over non-neighbouring slots, then fill the
    // remaining slots with distinct distractors.
    const copySlots = new Set(pickSpreadSlots(boardSize, cols, matches));
    const picked: string[] = [];
    let distractorIdx = 0;
    for (let slot = 0; slot < boardSize; slot++) {
      picked.push(copySlots.has(slot) ? animalKey : shuffledOthers[distractorIdx++]);
    }
    // Give each slot a unique vivid color that isn't the animal's own color
    const used = new Set<string>();
    return picked.map((key, slot) => {
      const avoid = ANIMAL_AVOID_COLORS[key];
      const color =
        TILE_PALETTE.find((c) => !used.has(c) && c !== avoid) ??
        TILE_PALETTE[slot % TILE_PALETTE.length];
      used.add(color);
      return {
        slot,
        key,
        word: t.animals[key] ?? animalData[key]?.word ?? key,
        icon: animalData[key]?.icon,
        isCorrect: key === animalKey,
        color,
      };
    });
  }, [animalKey, t, boardSize, cols, matches]);

  const spawnConfetti = () => {
    const pieces: Confetti[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
  };

  const handleClick = (slot: number, key: string, isCorrect: boolean) => {
    if (roundDone) return;
    if (isCorrect) {
      if (foundSlots.has(slot)) return;
      answeredKeyRef.current = animalKey;
      setFoundSlots((prev) => new Set(prev).add(slot));
      setScore((s) => s + 1);
      playSuccessSound();
      if (foundSlots.size + 1 >= matches) spawnConfetti();
    } else {
      setWrongPick(key);
      playWrongSound();
      window.setTimeout(() => setWrongPick(null), 450);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: 'calc(100vh - 64px)',
        '@supports (height: 100dvh)': {
          minHeight: 'calc(100dvh - 64px)',
        },
        bgcolor: '#FFFCEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: { xs: 3, sm: 6 },
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
        @keyframes confetti-fall {
          to { transform: translateY(110vh) rotate(720deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes badge-pop {
          0% { transform: scale(0) rotate(-30deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      {roundDone ? (
        <Typography
          data-pw="question"
          sx={{
            fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 700,
            color: '#FF8C42',
            mb: 2,
          }}
        >
          {`🎉 ${t.greatJob(animal?.word ?? '')}`}
        </Typography>
      ) : animal.icon ? (
        // Show the animal to find as a picture instead of the "Find all the
        // Cats…" text — the kid matches this target against the option tiles.
        <QuestionImage data-pw="question" src={animal.icon} alt={animal?.word ?? ''} />
      ) : (
        <Typography
          data-pw="question"
          sx={{
            fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 700,
            color: '#FF8C42',
            mb: 2,
          }}
        >
          {matches === 1
            ? t.questionOne(animal?.word ?? '')
            : t.questionMany(animal?.word ?? '', matches)}
        </Typography>
      )}

      <Stage>
        <StageGrid data-pw="stage-grid" $cols={cols} $rows={rows}>
          {options.map((opt) => {
            const isFound = foundSlots.has(opt.slot);
            return (
              <AnimalPhoto
                key={opt.slot}
                data-pw="option"
                data-found={isFound ? 'true' : 'false'}
                $wrong={wrongPick === opt.key && !isFound}
                $correct={isFound}
                $disabled={roundDone && !isFound}
                $color={opt.color}
                onClick={() => handleClick(opt.slot, opt.key, opt.isCorrect)}
              >
                <img src={opt.icon} alt={opt.word} />
                {isFound && (
                  <CheckBadge data-pw="option-check">
                    <CheckIcon sx={{ fontSize: 28 }} />
                  </CheckBadge>
                )}
              </AnimalPhoto>
            );
          })}
        </StageGrid>
      </Stage>

      {confetti.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          data-pw="confetti"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            background: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </Container>
  );
}
